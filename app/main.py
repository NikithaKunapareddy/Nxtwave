import os
import json
from pathlib import Path
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional, Dict, Any, Tuple, List
from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.config import settings, BASE_DIR
from app.database import init_db, get_db, SessionLocal
from app.models import BuildContract, PeerChallenge
from app.security import SecurityHeadersMiddleware
from fastapi.middleware.cors import CORSMiddleware
from app.analytics import seed_sample_growth_data
from app.supabase_client import (
    supabase_get_contract,
    supabase_get_challenges,
    get_supabase,
)

# Import API Routers
from app.routes.projects import router as projects_router
from app.routes.contracts import router as contracts_router
from app.routes.challenges import router as challenges_router
from app.routes.registration import router as registration_router
from app.routes.analytics import router as analytics_router
from app.routes.whatsapp import router as whatsapp_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup & shutdown events."""
    # Initialize DB schema
    init_db()
    # Seed presentation sample records if database is fresh
    db = SessionLocal()
    try:
        seed_sample_growth_data(db)
    finally:
        db.close()
    yield

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Project Selection, Technical Stress Testing, and Peer Validation Platform",
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# Ensure database tables exist on import as well as lifespan
init_db()

# Attach Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# Enable CORS for decoupled frontend deployments (Vercel, local dev, custom domains)
allowed_origins_env = settings.CORS_ORIGINS
if allowed_origins_env:
    allowed_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
else:
    allowed_origins = ["*"]

if settings.FRONTEND_URL and settings.FRONTEND_URL not in allowed_origins and allowed_origins != ["*"]:
    allowed_origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True if allowed_origins != ["*"] else False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Mount Static Files
static_dir = BASE_DIR / "app" / "static"
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Configure Jinja2 Templates
templates_dir = BASE_DIR / "app" / "templates"
templates = Jinja2Templates(directory=str(templates_dir))

# Include API Routers
app.include_router(projects_router)
app.include_router(contracts_router)
app.include_router(challenges_router)
app.include_router(registration_router)
app.include_router(analytics_router)
app.include_router(whatsapp_router)


def _resolve_contract_and_challenges(contract_id: str, db: Session) -> Tuple[Optional[Dict[str, Any]], List[Any]]:
    """Fetches a contract and its peer challenges from Supabase first, then local DB."""
    if not contract_id:
        return None, []

    supa = supabase_get_contract(contract_id)
    if supa:
        def parse_json_field(val, default):
            if isinstance(val, str):
                try:
                    return json.loads(val)
                except Exception:
                    return default
            return val or default

        contract_dict = {
            "contract_id": supa["contract_id"],
            "project_title": supa["project_title"],
            "original_idea": supa["original_idea"],
            "category": supa["category"],
            "domain": supa.get("category") or "AI/ML",
            "difficulty": supa["difficulty"],
            "feasibility_score": supa.get("feasibility_score") or 88,
            "frontend_rec": supa["frontend_rec"],
            "backend_rec": supa["backend_rec"],
            "ai_model_rec": supa["ai_model_rec"],
            "db_rec": supa["db_rec"],
            "tech_reasoning": supa["tech_reasoning"],
            "required_data": supa["required_data"],
            "critical_assumption": supa["critical_assumption"],
            "failure_scenarios": parse_json_field(supa.get("failure_scenarios_json"), []),
            "mvp_features": parse_json_field(supa.get("mvp_features_json"), []),
            "deferred_features": parse_json_field(supa.get("deferred_features_json"), []),
            "plan_60min": parse_json_field(supa.get("plan_60min_json"), []),
            "immediate_action": supa["immediate_action"],
            "peer_challenge_prompt": supa["peer_challenge_prompt"],
            "created_at": supa.get("created_at"),
        }
        supa_challenges = supabase_get_challenges(contract_id)
        return contract_dict, supa_challenges

    contract = db.query(BuildContract).filter(BuildContract.contract_id == contract_id).first()
    if not contract:
        return None, []

    challenges = (
        db.query(PeerChallenge)
        .filter(PeerChallenge.contract_id == contract_id)
        .order_by(PeerChallenge.created_at.desc())
        .all()
    )

    contract_dict = {
        "contract_id": contract.contract_id,
        "project_title": contract.project_title,
        "original_idea": contract.original_idea,
        "category": contract.category,
        "domain": contract.category or "AI/ML",
        "difficulty": contract.difficulty,
        "feasibility_score": 88,
        "frontend_rec": contract.frontend_rec,
        "backend_rec": contract.backend_rec,
        "ai_model_rec": contract.ai_model_rec,
        "db_rec": contract.db_rec,
        "tech_reasoning": contract.tech_reasoning,
        "required_data": contract.required_data,
        "critical_assumption": contract.critical_assumption,
        "failure_scenarios": contract.get_failure_scenarios(),
        "mvp_features": contract.get_mvp_features(),
        "deferred_features": contract.get_deferred_features(),
        "plan_60min": contract.get_plan_60min(),
        "immediate_action": contract.immediate_action,
        "peer_challenge_prompt": contract.peer_challenge_prompt,
        "created_at": contract.created_at,
    }
    return contract_dict, challenges


# ==============================================================================
# HTML FRONTEND ROUTES
# ==============================================================================

@app.get("/health", tags=["System Health"])
def health_check():
    """Health status endpoint for monitoring and deployment verification."""
    sb_ready = bool(get_supabase())
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "tagline": settings.APP_TAGLINE,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "zero_cost_local_mode": True,
        "database": "supabase_postgresql" if sb_ready else "sqlite_local",
        "supabase_connected": sb_ready,
        "optional_llm_enabled": settings.ENABLE_OPTIONAL_LLM,
        "whatsapp_mode": settings.WHATSAPP_MODE,
        "whatsapp_dry_run": settings.WHATSAPP_DRY_RUN
    }

@app.get("/", response_class=HTMLResponse, tags=["Frontend Pages"])
def page_home(request: Request):
    """Stage 1: Homepage & Value Proposition."""
    return templates.TemplateResponse(request=request, name="index.html", context={"settings": settings})

@app.get("/compare", response_class=HTMLResponse, tags=["Frontend Pages"])
def page_compare(request: Request, from_contract: Optional[str] = None, db: Session = Depends(get_db)):
    """Stage 2 & 3: Input Constraints & Compare Project Ideas (Supports continuing from a friend's shared contract)."""
    source_contract = None
    if from_contract:
        source_contract, _ = _resolve_contract_and_challenges(from_contract, db)
    return templates.TemplateResponse(
        request=request,
        name="compare.html",
        context={
            "settings": settings,
            "source_contract": source_contract,
        }
    )

@app.get("/contract/{contract_id}", response_class=HTMLResponse, tags=["Frontend Pages"])
def page_build_contract(contract_id: str, request: Request, db: Session = Depends(get_db)):
    """Stage 4: View Detailed Build Contract — Fetches from Supabase first."""
    contract_dict, challenges = _resolve_contract_and_challenges(contract_id, db)
    if not contract_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Build Contract '{contract_id}' not found.")

    return templates.TemplateResponse(
        request=request,
        name="contract.html",
        context={
            "contract": contract_dict,
            "challenges": challenges,
            "settings": settings
        }
    )

@app.get("/challenge/{contract_id}", response_class=HTMLResponse, tags=["Frontend Pages"])
def page_peer_challenge(contract_id: str, request: Request, db: Session = Depends(get_db)):
    """Stage 5: Break My Build — Peer Validation Page — Fetches from Supabase first."""
    contract_dict, challenges = _resolve_contract_and_challenges(contract_id, db)
    if not contract_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Build Contract '{contract_id}' not found.")

    return templates.TemplateResponse(
        request=request,
        name="challenge.html",
        context={
            "contract": contract_dict,
            "challenges": challenges,
            "settings": settings
        }
    )

@app.get("/register", response_class=HTMLResponse, tags=["Frontend Pages"])
def page_register(request: Request, contract_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Stage 6: Workshop Conversion Page — Preserves Contract Context if present."""
    linked_contract = None
    if contract_id:
        linked_contract, _ = _resolve_contract_and_challenges(contract_id, db)
    return templates.TemplateResponse(
        request=request,
        name="register.html",
        context={
            "settings": settings,
            "has_external_url": settings.has_external_workshop,
            "external_url": settings.WORKSHOP_REGISTRATION_URL,
            "linked_contract": linked_contract,
        }
    )

@app.get("/admin", response_class=HTMLResponse, tags=["Frontend Pages"])
def page_admin(request: Request):
    """Growth Campaign Analytics & Admin Panel."""
    return templates.TemplateResponse(request=request, name="admin.html", context={"settings": settings})

@app.get("/whatsapp", response_class=HTMLResponse, tags=["Frontend Pages"])
def page_whatsapp_simulator(request: Request):
    """WhatsApp Campus Community Bot Simulator."""
    return templates.TemplateResponse(request=request, name="whatsapp.html", context={"settings": settings})

@app.get("/privacy", response_class=HTMLResponse, tags=["Frontend Pages"])
def page_privacy(request: Request):
    """Privacy Notice & Data Handling."""
    return templates.TemplateResponse(request=request, name="privacy.html", context={"settings": settings})

