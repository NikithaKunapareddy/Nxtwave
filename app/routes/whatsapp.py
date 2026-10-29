"""
app/routes/whatsapp.py
Meta WhatsApp Cloud API — Webhook + Simulator Routes

Endpoints:
  GET  /webhook              — Meta webhook verification (hub.challenge handshake)
  POST /webhook              — Inbound messages & status updates from Meta
  POST /api/whatsapp/simulate — Zero-cost local simulator (no real API calls)
  GET  /api/whatsapp/status  — Integration health & configuration status
"""
import hashlib
import hmac
import json
import logging
from typing import Optional

from fastapi import APIRouter, Depends, Query, Request, Response, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import BuildContract, WhatsAppMessageLog
from app.schemas import CandidateIdeaInput, ProjectComparisonRequest
from app.services.project_analyzer import analyze_and_rank_candidates
from app.services.contract_planner import generate_build_contract_data
from app.security import sanitize_string
from app.analytics import record_event
from app.whatsapp.parser import parse_webhook_payload
from app.whatsapp.conversation import handle_inbound
from app.whatsapp import messages as msg

logger = logging.getLogger(__name__)
router = APIRouter(tags=["WhatsApp Cloud API"])


# ==============================================================================
# 1. WEBHOOK VERIFICATION  (GET /webhook)
# ==============================================================================

@router.get("/webhook", summary="Meta webhook verification handshake")
def meta_whatsapp_verify_webhook(
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge"),
):
    """
    Meta calls this endpoint when you configure the webhook in the Meta
    App Dashboard. It checks hub.verify_token matches your secret and
    returns hub.challenge as plain text.
    """
    if hub_mode == "subscribe" and hub_verify_token == settings.WHATSAPP_VERIFY_TOKEN:
        logger.info("[WA-Webhook] Verified successfully.")
        return Response(content=hub_challenge, media_type="text/plain")

    logger.warning("[WA-Webhook] Verification FAILED — token mismatch.")
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Webhook verification failed: token mismatch.",
    )


# ==============================================================================
# 2. INBOUND WEBHOOK  (POST /webhook)
# ==============================================================================

@router.post("/webhook", summary="Receive inbound WhatsApp messages from Meta")
async def meta_whatsapp_inbound_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Meta POSTs all inbound messages and delivery status updates here.

    Security:
      - HMAC-SHA256 signature validation via X-Hub-Signature-256 header
        (requires META_APP_SECRET in .env).
      - Duplicate message deduplication by wamid.
      - Always returns 200 OK immediately — processing is async.
    """
    raw_body = await request.body()

    # ── Signature validation (when META_APP_SECRET is configured) ────────────
    if settings.META_APP_SECRET:
        signature_header = request.headers.get("X-Hub-Signature-256", "")
        expected = _compute_signature(raw_body, settings.META_APP_SECRET)
        if not hmac.compare_digest(signature_header, expected):
            logger.warning("[WA-Webhook] Invalid HMAC signature — rejected.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid webhook signature.",
            )
    else:
        logger.debug("[WA-Webhook] META_APP_SECRET not set — skipping signature check.")

    # ── Parse payload ─────────────────────────────────────────────────────────
    try:
        payload = json.loads(raw_body)
    except json.JSONDecodeError:
        logger.warning("[WA-Webhook] Non-JSON payload received — ignoring.")
        return {"status": "ok"}  # Must return 200 so Meta doesn't retry

    inbound_messages, status_updates = parse_webhook_payload(payload)

    logger.info(
        "[WA-Webhook] %d message(s), %d status update(s) received.",
        len(inbound_messages), len(status_updates),
    )

    # Log status updates
    for su in status_updates:
        logger.info("[WA-Status] wamid=%s status=%s", su.wamid[:16], su.status)

    # ── Process each inbound message in the background ────────────────────────
    for inbound in inbound_messages:
        if inbound.msg_type not in ("text", "interactive", "button"):
            # Unsupported type — send a friendly reply but don't process
            background_tasks.add_task(
                _send_unsupported_reply, inbound.wa_id, db
            )
            continue
        # Dispatch to FSM (runs after we return 200 to Meta)
        background_tasks.add_task(handle_inbound, inbound, db)

    # Always acknowledge 200 immediately
    return {"status": "ok"}


# ==============================================================================
# 3. LOCAL SIMULATOR  (POST /api/whatsapp/simulate)
# ==============================================================================

class WhatsAppSimulateRequest(BaseModel):
    message: str = Field(..., min_length=3, max_length=500,
                         description="Project idea sent via WhatsApp")
    experience: Optional[str] = "intermediate"
    domain: Optional[str] = "AI/ML"
    sender_name: Optional[str] = "Campus Student"


class WhatsAppSimulateResponse(BaseModel):
    reply_text: str
    reply: Optional[str] = None
    contract_url: Optional[str] = None
    workshop_cta: str
    mode: str
    is_dry_run: bool


@router.post("/api/whatsapp/simulate", response_model=WhatsAppSimulateResponse,
             summary="Zero-cost WhatsApp interaction simulator")
def simulate_whatsapp_interaction(
    sim_in: WhatsAppSimulateRequest,
    req: Request,
    db: Session = Depends(get_db),
):
    """
    Tests the full Project Compass WhatsApp analysis pipeline locally
    without making any network calls or consuming API credits.
    Used by the /whatsapp web page simulator.
    """
    clean_msg = sanitize_string(sim_in.message)
    base_url = (settings.FRONTEND_URL or str(req.base_url)).rstrip("/")

    req_obj = ProjectComparisonRequest(
        domain=sim_in.domain or "AI/ML",
        experience=sim_in.experience or "intermediate",
        languages=["Python"],
        time_weeks=4,
        team_size=1,
        resources=["laptop"],
        primary_goal="college_project",
        candidates=[CandidateIdeaInput(
            title=clean_msg[:40],
            description=clean_msg if len(clean_msg) >= 10 else clean_msg + " project for engineering students"
        )],
        utm_source="whatsapp_simulator",
    )

    comp_res = analyze_and_rank_candidates(req_obj)
    top_project = comp_res.recommended_project

    contract_data = generate_build_contract_data(
        title=top_project.title,
        description=top_project.description,
        domain=req_obj.domain,
        experience=req_obj.experience,
        languages=req_obj.languages,
        referral_source="whatsapp_simulator",
    )

    db_contract = BuildContract(
        contract_id=contract_data["contract_id"],
        comparison_id=comp_res.comparison_id,
        project_title=contract_data["project_title"],
        original_idea=contract_data["original_idea"],
        category=contract_data["category"],
        difficulty=contract_data["difficulty"],
        frontend_rec=contract_data["frontend_rec"],
        backend_rec=contract_data["backend_rec"],
        ai_model_rec=contract_data["ai_model_rec"],
        db_rec=contract_data["db_rec"],
        tech_reasoning=contract_data["tech_reasoning"],
        required_data=contract_data["required_data"],
        critical_assumption=contract_data["critical_assumption"],
        failure_scenarios_json=json.dumps([s.model_dump() for s in contract_data["failure_scenarios"]]),
        mvp_features_json=json.dumps(contract_data["mvp_features"]),
        deferred_features_json=json.dumps(contract_data["deferred_features"]),
        plan_60min_json=json.dumps([p.model_dump() for p in contract_data["plan_60min"]]),
        immediate_action=contract_data["immediate_action"],
        peer_challenge_prompt=contract_data["peer_challenge_prompt"],
        analysis_mode="rules_based",
        referral_source="whatsapp_simulator",
    )
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)

    reply = msg.build_analysis_reply(
        project_title=contract_data["project_title"],
        composite_score=top_project.composite_score,
        difficulty=contract_data["difficulty"],
        category=contract_data["category"],
        frontend=contract_data["frontend_rec"],
        backend=contract_data["backend_rec"],
        ai_model=contract_data["ai_model_rec"],
        critical_assumption=contract_data["critical_assumption"],
        immediate_action=contract_data["immediate_action"],
        contract_id=db_contract.contract_id,
        base_url=base_url,
    )

    record_event(
        db=db,
        event_name="whatsapp_simulated_interaction",
        contract_id=db_contract.contract_id,
        utm_source="whatsapp_sim",
        metadata={"sender": sim_in.sender_name},
    )

    return WhatsAppSimulateResponse(
        reply_text=reply,
        reply=reply,
        contract_url=f"{base_url}/contract/{db_contract.contract_id}",
        workshop_cta="Build Your First AI Project in 60 Minutes (NxtWave Free Workshop)",
        mode=settings.WHATSAPP_MODE,
        is_dry_run=settings.WHATSAPP_DRY_RUN,
    )


# ==============================================================================
# 4. INTEGRATION STATUS  (GET /api/whatsapp/status)
# ==============================================================================

@router.get("/api/whatsapp/status", summary="WhatsApp integration configuration status")
def whatsapp_status():
    """Returns current WhatsApp integration health and configuration status."""
    return {
        "mode": settings.WHATSAPP_MODE,
        "ready": settings.whatsapp_ready,
        "phone_number_id_configured": bool(settings.WHATSAPP_PHONE_NUMBER_ID),
        "access_token_configured": bool(settings.WHATSAPP_ACCESS_TOKEN),
        "verify_token_configured": bool(settings.WHATSAPP_VERIFY_TOKEN),
        "app_secret_configured": bool(settings.META_APP_SECRET),
        "allowed_recipients_count": len(settings.WHATSAPP_ALLOWED_RECIPIENTS),
        "api_version": settings.WHATSAPP_API_VERSION,
        "webhook_url": f"{settings.PUBLIC_BASE_URL}/webhook",
        "graph_api_url": settings.whatsapp_graph_url if settings.WHATSAPP_PHONE_NUMBER_ID else "not_configured",
        "instructions": (
            "Set WHATSAPP_MODE=test and add your number to WHATSAPP_ALLOWED_RECIPIENTS "
            "to send real test messages. Use ngrok to expose /webhook over HTTPS."
            if not settings.whatsapp_ready
            else "WhatsApp integration is configured and ready."
        ),
    }


# ==============================================================================
# 5. MESSAGE LOG  (GET /api/whatsapp/logs)
# ==============================================================================

@router.get("/api/whatsapp/logs", summary="Recent WhatsApp message log (admin)")
def whatsapp_message_logs(
    limit: int = Query(50, ge=1, le=200),
    admin_token: str = Query(...),
    db: Session = Depends(get_db),
):
    """Returns recent WhatsApp message log entries. Requires admin token."""
    if admin_token != settings.ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid admin token.")

    logs = (
        db.query(WhatsAppMessageLog)
        .order_by(WhatsAppMessageLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "log_id": l.log_id,
            "direction": l.direction,
            "wa_id_tail": "****" + l.wa_id[-4:] if len(l.wa_id) > 4 else "****",
            "body_preview": (l.body or "")[:80],
            "state_before": l.state_before,
            "state_after": l.state_after,
            "status": l.status,
            "error_detail": l.error_detail,
            "created_at": l.created_at.isoformat() if l.created_at else None,
        }
        for l in logs
    ]


# ==============================================================================
# Helpers
# ==============================================================================

def _compute_signature(raw_body: bytes, app_secret: str) -> str:
    """Compute HMAC-SHA256 signature of the raw request body."""
    digest = hmac.new(
        app_secret.encode("utf-8"),
        raw_body,
        hashlib.sha256,
    ).hexdigest()
    return f"sha256={digest}"


async def _send_unsupported_reply(wa_id: str, db: Session) -> None:
    """Send unsupported media type reply."""
    from app.whatsapp.client import send_text_message
    await send_text_message(wa_id, msg.UNSUPPORTED_TYPE_MESSAGE)
