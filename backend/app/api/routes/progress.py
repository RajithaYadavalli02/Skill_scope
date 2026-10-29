
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import (
    User,
    AnalysisHistory,
    RoadmapMilestone,
    UserSkill,
    JobRole,
    RoleSkillRequirement,
)
from app.schemas.resource import ProgressHistoryOut
from app.services.hybrid_analyzer import perform_hybrid_analysis


router = APIRouter(prefix="/progress", tags=["Progress Tracker"])


@router.get("/summary")
def get_progress_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return high-level KPI metrics for the student dashboard and tracker."""

    target_role_id = current_user.target_role_id

    if not target_role_id:
        first_role = db.query(JobRole).first()
        target_role_id = first_role.id if first_role else None

    role = (
        db.query(JobRole)
        .filter(JobRole.id == target_role_id)
        .first()
        if target_role_id
        else None
    )

    milestones = (
        db.query(RoadmapMilestone)
        .filter(
            RoadmapMilestone.user_id == current_user.id,
            RoadmapMilestone.role_id == target_role_id,
        )
        .all()
        if target_role_id
        else []
    )

    total_milestones = len(milestones)
    completed_milestones = sum(
        1 for milestone in milestones if milestone.status == "completed"
    )
    in_progress_milestones = sum(
        1 for milestone in milestones if milestone.status == "in_progress"
    )

    total_hours_invested = sum(
        milestone.estimated_hours
        for milestone in milestones
        if milestone.status == "completed"
    )

    requirements = (
        db.query(RoleSkillRequirement)
        .filter(RoleSkillRequirement.role_id == target_role_id)
        .all()
        if target_role_id
        else []
    )

    user_skills = (
        db.query(UserSkill)
        .filter(UserSkill.user_id == current_user.id)
        .all()
    )

    analysis = (
        perform_hybrid_analysis(role, requirements, user_skills)
        if role
        else None
    )

    return {
        "user_name": current_user.name,
        "target_role_id": target_role_id,
        "target_role_title": role.title if role else "Not Selected",
        "composite_readiness_score": (
            analysis.composite_readiness_score if analysis else 0.0
        ),
        "rule_match_pct": (
            analysis.rule_metrics.overall_match_percentage if analysis else 0.0
        ),
        "nlp_semantic_pct": (
            analysis.nlp_metrics.semantic_match_percentage if analysis else 0.0
        ),
        "readiness_band": analysis.readiness_band if analysis else "Initial",
        "total_skills_acquired": len(user_skills),
        "total_milestones": total_milestones,
        "completed_milestones": completed_milestones,
        "in_progress_milestones": in_progress_milestones,
        "completion_percentage": (
            round(completed_milestones / total_milestones * 100, 1)
            if total_milestones > 0
            else 0.0
        ),
        "hours_invested": total_hours_invested,
        "missing_critical_count": (
            analysis.rule_metrics.missing_critical_count if analysis else 0
        ),
    }


@router.get("/history", response_model=List[ProgressHistoryOut])
def get_progress_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return recent evaluation history for the selected target role."""

    target_role_id = current_user.target_role_id

    if not target_role_id:
        return []

    history = (
        db.query(AnalysisHistory)
        .filter(
            AnalysisHistory.user_id == current_user.id,
            AnalysisHistory.role_id == target_role_id,
        )
        .order_by(AnalysisHistory.id.desc())
        .limit(15)
        .all()
    )

    return [
        ProgressHistoryOut(
            id=item.id,
            role_id=item.role_id,
            role_title=item.role.title if item.role else "Unknown Role",
            rule_score=round(item.rule_score, 1),
            nlp_score=round(item.nlp_score, 1),
            hybrid_score=round(item.hybrid_score, 1),
            matched_skills_count=item.matched_skills_count,
            critical_gaps_count=item.critical_gaps_count,
            created_at=(
                item.created_at.strftime("%Y-%m-%d %H:%M")
                if item.created_at
                else ""
            ),
        )
        for item in history
    ]
