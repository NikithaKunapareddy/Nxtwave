"""
app/whatsapp/conversation.py
Multi-turn FSM conversation state machine for Project Compass WhatsApp bot.

States:
  idle              → Waiting for START / HELP / or a free-form idea
  awaiting_idea     → Sent "tell me your idea" prompt; collecting idea text
  awaiting_exp      → Collected idea; asking for experience level
  awaiting_domain   → Collected experience; asking for domain
  analysing         → Running deterministic scoring; ephemeral
  done              → Sent result; waiting for START / STATUS / DEMO

Commands handled in any state:
  HELP, RESET, STATUS, DEMO, PRIVACY
"""
from __future__ import annotations
import json
import logging
from typing import Optional, Tuple

from sqlalchemy.orm import Session

from app.config import settings
from app.models import (
    WhatsAppConversationState,
    ProcessedWhatsAppMessage,
    WhatsAppMessageLog,
    BuildContract,
)
from app.schemas import CandidateIdeaInput, ProjectComparisonRequest
from app.services.project_analyzer import analyze_and_rank_candidates
from app.services.contract_planner import generate_build_contract_data
from app.analytics import record_event
from app.whatsapp import messages as msg
from app.whatsapp.client import send_text_message
from app.whatsapp.parser import InboundMessage

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────────────────
# Public entry point
# ──────────────────────────────────────────────────────────────────────────────

async def handle_inbound(inbound: InboundMessage, db: Session) -> None:
    """
    Main dispatcher for an inbound WhatsApp message.
    Handles deduplication, FSM transitions, analysis, and reply dispatch.
    """
    # 1. Deduplication — skip if we've already processed this wamid
    if _already_processed(inbound.wamid, db):
        logger.info("[WA-FSM] Duplicate wamid %s — skipped.", inbound.wamid[:16])
        return

    # 2. Mark as processed immediately
    _mark_processed(inbound.wamid, inbound.wa_id, db)

    # 3. Load or create conversation state
    conv = _get_or_create_state(inbound.wa_id, db)
    state_before = conv.state
    body_lower = inbound.body.strip().lower()

    # 4. Log inbound message
    _log_message(db, "inbound", inbound.wa_id, inbound.wamid, inbound.body, state_before, state_before)

    # 5. Global commands — handled in any state
    reply_text = await _handle_global_command(body_lower, conv, db)

    if reply_text is None:
        # 6. State-specific FSM transitions
        reply_text, new_state = await _fsm_transition(body_lower, inbound.body, conv, db)
        conv.state = new_state
    else:
        # Global command handled — reset state only on RESET
        if body_lower == "reset":
            conv.state = "idle"

    conv.message_count = (conv.message_count or 0) + 1
    db.add(conv)
    db.commit()

    # 7. Send reply
    base_url = settings.FRONTEND_URL or settings.PUBLIC_BASE_URL
    await _send_reply(inbound.wa_id, reply_text, state_before, conv.state, db)


# ──────────────────────────────────────────────────────────────────────────────
# Global command handler
# ──────────────────────────────────────────────────────────────────────────────

async def _handle_global_command(
    body_lower: str, conv: WhatsAppConversationState, db: Session
) -> Optional[str]:
    """Return reply text if body is a global command, else None."""
    base_url = settings.FRONTEND_URL or settings.PUBLIC_BASE_URL

    if body_lower in ("help", "menu", "hi", "hello", "hii", "hey"):
        return msg.HELP_MESSAGE

    if body_lower in ("privacy", "data", "gdpr"):
        return msg.PRIVACY_MESSAGE

    if body_lower == "reset":
        ctx = {}
        conv.set_context(ctx)
        conv.last_contract_id = None
        return msg.RESET_MESSAGE

    if body_lower in ("status", "my contract", "last contract"):
        return msg.build_status_reply(conv.last_contract_id, base_url)

    if body_lower == "demo":
        return msg.build_demo_reply(base_url)

    return None


# ──────────────────────────────────────────────────────────────────────────────
# FSM transition logic
# ──────────────────────────────────────────────────────────────────────────────

async def _fsm_transition(
    body_lower: str,
    body_raw: str,
    conv: WhatsAppConversationState,
    db: Session,
) -> Tuple[str, str]:
    """Returns (reply_text, new_state)."""
    state = conv.state
    ctx = conv.get_context()
    base_url = settings.FRONTEND_URL or settings.PUBLIC_BASE_URL

    # ── idle / done ────────────────────────────────────────────────────────────
    if state in ("idle", "done"):
        if body_lower in ("start", "analyse", "analyze", "begin", "go"):
            return msg.ASK_IDEA_MESSAGE, "awaiting_idea"
        # Free-form text treated as a project idea directly
        if len(body_raw.strip()) >= 10:
            ctx["idea"] = body_raw.strip()
            conv.set_context(ctx)
            return msg.ASK_EXPERIENCE_MESSAGE, "awaiting_exp"
        return msg.WELCOME_MESSAGE, "idle"

    # ── awaiting_idea ──────────────────────────────────────────────────────────
    if state == "awaiting_idea":
        if len(body_raw.strip()) < 10:
            return "🤔 Please give me a bit more detail (at least 10 characters).", "awaiting_idea"
        ctx["idea"] = body_raw.strip()
        conv.set_context(ctx)
        return msg.ASK_EXPERIENCE_MESSAGE, "awaiting_exp"

    # ── awaiting_exp ───────────────────────────────────────────────────────────
    if state == "awaiting_exp":
        experience = msg.EXPERIENCE_MAP.get(body_lower)
        if not experience:
            return (
                "⚠️ Please reply with *1*, *2*, or *3* for your experience level.",
                "awaiting_exp",
            )
        ctx["experience"] = experience
        conv.set_context(ctx)
        return msg.ASK_DOMAIN_MESSAGE, "awaiting_domain"

    # ── awaiting_domain ────────────────────────────────────────────────────────
    if state == "awaiting_domain":
        domain = msg.DOMAIN_MAP.get(body_lower)
        if not domain:
            return (
                "⚠️ Please reply with a number 1–6 or the domain name.",
                "awaiting_domain",
            )
        ctx["domain"] = domain
        conv.set_context(ctx)
        # Kick off the analysis
        reply = await _run_analysis(ctx, conv, db, base_url)
        return reply, "done"

    # ── analysing (should not receive a message, but handle gracefully) ────────
    if state == "analysing":
        return "⏳ Still working on it! Give me a moment…", "analysing"

    # Fallback
    return msg.WELCOME_MESSAGE, "idle"


# ──────────────────────────────────────────────────────────────────────────────
# Analysis runner
# ──────────────────────────────────────────────────────────────────────────────

async def _run_analysis(ctx: dict, conv: WhatsAppConversationState, db: Session, base_url: str) -> str:
    """Run deterministic scoring and return formatted reply."""
    try:
        idea = ctx.get("idea", "My project idea")
        experience = ctx.get("experience", "intermediate")
        domain = ctx.get("domain", "AI/ML")

        req_obj = ProjectComparisonRequest(
            domain=domain,
            experience=experience,
            languages=["Python"],
            time_weeks=4,
            team_size=1,
            resources=["laptop", "internet"],
            primary_goal="college_project",
            candidates=[CandidateIdeaInput(
                title=idea[:40],
                description=idea if len(idea) >= 10 else idea + " (auto-expanded for analysis)"
            )],
            utm_source="whatsapp_bot",
        )

        comp_res = analyze_and_rank_candidates(req_obj)
        top = comp_res.recommended_project

        contract_data = generate_build_contract_data(
            title=top.title,
            description=top.description,
            domain=domain,
            experience=experience,
            languages=["Python"],
            referral_source="whatsapp_bot",
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
            referral_source="whatsapp_bot",
        )
        db.add(db_contract)
        db.commit()
        db.refresh(db_contract)

        conv.last_contract_id = db_contract.contract_id

        record_event(db=db, event_name="whatsapp_analysis_complete",
                     contract_id=db_contract.contract_id, utm_source="whatsapp_bot",
                     metadata={"wa_id_tail": conv.wa_id[-4:]})

        return msg.build_analysis_reply(
            project_title=contract_data["project_title"],
            composite_score=top.composite_score,
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

    except Exception as exc:
        logger.exception("[WA-FSM] Analysis error: %s", exc)
        return msg.ERROR_MESSAGE


# ──────────────────────────────────────────────────────────────────────────────
# DB helpers
# ──────────────────────────────────────────────────────────────────────────────

def _already_processed(wamid: str, db: Session) -> bool:
    return db.query(ProcessedWhatsAppMessage).filter_by(wamid=wamid).first() is not None


def _mark_processed(wamid: str, wa_id: str, db: Session) -> None:
    db.add(ProcessedWhatsAppMessage(wamid=wamid, wa_id=wa_id))
    try:
        db.commit()
    except Exception:
        db.rollback()


def _get_or_create_state(wa_id: str, db: Session) -> WhatsAppConversationState:
    conv = db.query(WhatsAppConversationState).filter_by(wa_id=wa_id).first()
    if not conv:
        conv = WhatsAppConversationState(wa_id=wa_id, state="idle")
        db.add(conv)
        db.commit()
        db.refresh(conv)
    return conv


def _log_message(
    db: Session,
    direction: str,
    wa_id: str,
    wamid: Optional[str],
    body: str,
    state_before: str,
    state_after: str,
    status: str = "ok",
    error_detail: Optional[str] = None,
) -> None:
    from app.models import WhatsAppMessageLog
    # Truncate body for log safety — never store raw user data beyond 200 chars
    safe_body = (body or "")[:200]
    db.add(WhatsAppMessageLog(
        direction=direction,
        wa_id=wa_id,
        wamid=wamid,
        body=safe_body,
        state_before=state_before,
        state_after=state_after,
        status=status,
        error_detail=error_detail,
    ))
    try:
        db.commit()
    except Exception:
        db.rollback()


async def _send_reply(
    wa_id: str,
    text: str,
    state_before: str,
    state_after: str,
    db: Session,
) -> None:
    """Send and log an outbound message."""
    result = await send_text_message(wa_id, text)
    status = "ok" if result["success"] else "error"
    _log_message(
        db, "outbound", wa_id, result.get("wamid"),
        text[:200], state_before, state_after,
        status=status,
        error_detail=result.get("detail") if not result["success"] else None,
    )
