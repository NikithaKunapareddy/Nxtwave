import json
import logging
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import BuildContract, PeerChallenge
from app.schemas import (
    BuildContractCreateRequest,
    BuildContractResponse,
    FailureScenario,
    Plan60MinMilestone
)
from app.services.contract_planner import generate_build_contract_data
from app.security import verify_rate_limit, sanitize_string
from app.analytics import record_event
from app.config import settings
from app.supabase_client import (
    supabase_save_contract,
    supabase_get_contract,
    supabase_get_challenges,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/contracts", tags=["Build Contracts"])


def serialize_contract_model(contract: BuildContract, req: Request) -> BuildContractResponse:
    """Helper to convert SQLAlchemy BuildContract model to Pydantic response schema."""
    base_url = (settings.FRONTEND_URL or str(req.base_url)).rstrip("/")
    failure_scenarios = [FailureScenario(**item) for item in contract.get_failure_scenarios()]
    plan_60min = [Plan60MinMilestone(**item) for item in contract.get_plan_60min()]

    return BuildContractResponse(
        contract_id=contract.contract_id,
        comparison_id=contract.comparison_id,
        project_title=contract.project_title,
        original_idea=contract.original_idea,
        category=contract.category,
        difficulty=contract.difficulty,
        frontend_rec=contract.frontend_rec,
        backend_rec=contract.backend_rec,
        ai_model_rec=contract.ai_model_rec,
        db_rec=contract.db_rec,
        tech_reasoning=contract.tech_reasoning,
        required_data=contract.required_data,
        critical_assumption=contract.critical_assumption,
        failure_scenarios=failure_scenarios,
        mvp_features=contract.get_mvp_features(),
        deferred_features=contract.get_deferred_features(),
        plan_60min=plan_60min,
        immediate_action=contract.immediate_action,
        peer_challenge_prompt=contract.peer_challenge_prompt,
        analysis_mode=contract.analysis_mode,
        share_url=f"{base_url}/contract/{contract.contract_id}",
        challenge_url=f"{base_url}/challenge/{contract.contract_id}",
        challenges_count=len(contract.challenges) if hasattr(contract, "challenges") and contract.challenges else 0,
        created_at=contract.created_at or datetime.utcnow(),
    )


def serialize_contract_dict(d: dict, req: Request) -> BuildContractResponse:
    """Helper to convert Supabase contract dict to Pydantic response schema."""
    base_url = (settings.FRONTEND_URL or str(req.base_url)).rstrip("/")
    scenarios_raw = d.get("failure_scenarios_json", "[]")
    if isinstance(scenarios_raw, str):
        try:
            scenarios_list = json.loads(scenarios_raw)
        except Exception:
            scenarios_list = []
    else:
        scenarios_list = scenarios_raw or []
    failure_scenarios = [FailureScenario(**item) for item in scenarios_list]

    plan_raw = d.get("plan_60min_json", "[]")
    if isinstance(plan_raw, str):
        try:
            plan_list = json.loads(plan_raw)
        except Exception:
            plan_list = []
    else:
        plan_list = plan_raw or []
    plan_60min = [Plan60MinMilestone(**item) for item in plan_list]

    mvp_raw = d.get("mvp_features_json", "[]")
    if isinstance(mvp_raw, str):
        try:
            mvp_features = json.loads(mvp_raw)
        except Exception:
            mvp_features = []
    else:
        mvp_features = mvp_raw or []

    def_raw = d.get("deferred_features_json", "[]")
    if isinstance(def_raw, str):
        try:
            deferred_features = json.loads(def_raw)
        except Exception:
            deferred_features = []
    else:
        deferred_features = def_raw or []

    created_at = d.get("created_at")
    if isinstance(created_at, str):
        try:
            created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        except Exception:
            created_at = datetime.utcnow()
    elif not created_at:
        created_at = datetime.utcnow()

    challenges = supabase_get_challenges(d["contract_id"])

    return BuildContractResponse(
        contract_id=d["contract_id"],
        comparison_id=d.get("comparison_id"),
        project_title=d["project_title"],
        original_idea=d["original_idea"],
        category=d["category"],
        difficulty=d["difficulty"],
        frontend_rec=d["frontend_rec"],
        backend_rec=d["backend_rec"],
        ai_model_rec=d["ai_model_rec"],
        db_rec=d["db_rec"],
        tech_reasoning=d["tech_reasoning"],
        required_data=d["required_data"],
        critical_assumption=d["critical_assumption"],
        failure_scenarios=failure_scenarios,
        mvp_features=mvp_features,
        deferred_features=deferred_features,
        plan_60min=plan_60min,
        immediate_action=d["immediate_action"],
        peer_challenge_prompt=d["peer_challenge_prompt"],
        analysis_mode=d.get("analysis_mode", "rules_based"),
        share_url=f"{base_url}/contract/{d['contract_id']}",
        challenge_url=f"{base_url}/challenge/{d['contract_id']}",
        challenges_count=len(challenges),
        created_at=created_at,
    )


@router.post("", response_model=BuildContractResponse)
def create_build_contract(
    contract_in: BuildContractCreateRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """Generates and persists a structured Build Contract to Supabase and local DB."""
    verify_rate_limit(req)

    title = sanitize_string(contract_in.selected_project_title)
    desc = sanitize_string(contract_in.selected_project_description)

    contract_data = generate_build_contract_data(
        title=title,
        description=desc,
        domain=contract_in.domain or "AI/ML",
        experience=contract_in.experience or "intermediate",
        languages=contract_in.languages or ["Python"],
        time_weeks=contract_in.time_weeks or 4,
        team_size=contract_in.team_size or 1,
        resources=contract_in.resources or ["laptop"],
        primary_goal=contract_in.primary_goal or "college_project",
        comparison_id=contract_in.comparison_id,
        referral_source=contract_in.referral_source
    )

    # 1. Primary: Save to Supabase
    supabase_save_contract(contract_data)

    # 2. Local DB persistence (for offline/test mode)
    try:
        db_contract = BuildContract(
            contract_id=contract_data["contract_id"],
            comparison_id=contract_data["comparison_id"],
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
            analysis_mode=contract_data["analysis_mode"],
            referral_source=contract_data["referral_source"]
        )
        db.add(db_contract)
        db.commit()
        db.refresh(db_contract)
    except Exception as e:
        logger.warning("[DB] Local contract save warning: %s", e)

    # Record analytics event
    client_ip = req.client.host if req.client else None
    record_event(
        db=db,
        event_name="build_contract_created",
        contract_id=contract_data["contract_id"],
        client_ip=client_ip,
        metadata={"category": contract_data["category"], "difficulty": contract_data["difficulty"]}
    )

    # Check Supabase first, fallback to model
    supa_record = supabase_get_contract(contract_data["contract_id"])
    if supa_record:
        return serialize_contract_dict(supa_record, req)

    return serialize_contract_model(db_contract, req)


@router.get("/{contract_id}", response_model=BuildContractResponse)
def get_build_contract(
    contract_id: str,
    req: Request,
    db: Session = Depends(get_db)
):
    """Retrieves a public Build Contract by unique identifier — checks Supabase first!"""
    # 1. Check Supabase first (primary persistent source)
    supa_contract = supabase_get_contract(contract_id)
    if supa_contract:
        return serialize_contract_dict(supa_contract, req)

    # 2. Check local DB fallback
    contract = db.query(BuildContract).filter(BuildContract.contract_id == contract_id).first()
    if contract:
        return serialize_contract_model(contract, req)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Build Contract '{contract_id}' not found."
    )
