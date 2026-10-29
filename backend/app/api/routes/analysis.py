from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import User, JobRole, RoleSkillRequirement, UserSkill, AnalysisHistory
from app.schemas.analysis import AnalysisResponse
from app.services.hybrid_analyzer import perform_hybrid_analysis

router = APIRouter(prefix="/analysis", tags=["Skill Gap Analysis"])

@router.get("", response_model=AnalysisResponse)
def analyze_gap(
    role_id: Optional[int] = Query(None, description="Optional role ID to analyze against; defaults to user's target role"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Performs dynamic Dual-Engine Skill Gap Analysis:
      - Rule-Based Calculation (Deterministic exact matches, core/elective scores, proficiency deficits)
      - NLP TF-IDF Cosine Similarity Engine (Unsupervised semantic text proximity & transferable skill credit)
    """
    target_role_id = role_id or current_user.target_role_id

    if not target_role_id:
        # Default to first role if not set
        first_role = db.query(JobRole).first()
        if not first_role:
            raise HTTPException(status_code=404, detail="No job roles configured in system")
        target_role_id = first_role.id

    role = db.query(JobRole).filter(JobRole.id == target_role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Selected job role not found")

    requirements = db.query(RoleSkillRequirement).filter(
        RoleSkillRequirement.role_id == role.id
    ).all()

    user_skills = db.query(UserSkill).filter(
        UserSkill.user_id == current_user.id
    ).all()

    analysis_result = perform_hybrid_analysis(role, requirements, user_skills)

    # Record historical snapshot for progress tracking
    history_entry = AnalysisHistory(
        user_id=current_user.id,
        role_id=role.id,
        rule_score=analysis_result.rule_metrics.overall_match_percentage,
        nlp_score=analysis_result.nlp_metrics.semantic_match_percentage,
        hybrid_score=analysis_result.composite_readiness_score,
        matched_skills_count=len(analysis_result.matched_skills),
        critical_gaps_count=analysis_result.rule_metrics.missing_critical_count
    )
    db.add(history_entry)
    db.commit()

    return analysis_result

@router.get("/compare-all")
def compare_all_roles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluates current candidate skills against all 9 job tracks simultaneously.
    Provides academic ranking of role alignment and transferable suitability.
    """
    roles = db.query(JobRole).all()
    user_skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()

    comparisons = []
    for r in roles:
        reqs = db.query(RoleSkillRequirement).filter(RoleSkillRequirement.role_id == r.id).all()
        analysis = perform_hybrid_analysis(r, reqs, user_skills)

        comparisons.append({
            "role_id": r.id,
            "title": r.title,
            "slug": r.slug,
            "department": r.department,
            "market_demand": r.market_demand,
            "composite_readiness_score": analysis.composite_readiness_score,
            "rule_match_pct": analysis.rule_metrics.overall_match_percentage,
            "nlp_semantic_pct": analysis.nlp_metrics.semantic_match_percentage,
            "readiness_band": analysis.readiness_band,
            "missing_critical_count": analysis.rule_metrics.missing_critical_count,
            "estimated_weeks": analysis.estimated_learning_weeks
        })

    # Sort descending by composite readiness score
    comparisons.sort(key=lambda x: x["composite_readiness_score"], reverse=True)
    return comparisons

