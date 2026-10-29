from typing import Optional
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import User, JobRole, RoleSkillRequirement, UserSkill, RoadmapMilestone
from app.schemas.roadmap import (
    RoadmapResponse,
    RoadmapPhaseOut,
    RoadmapMilestoneOut,
    UpdateMilestoneStatusRequest,
)
from app.services.roadmap_generator import generate_personalized_roadmap

router = APIRouter(prefix="/roadmap", tags=["Personalized Learning Roadmap"])

@router.get("", response_model=RoadmapResponse)
def get_roadmap(
    role_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve personalized roadmap organized by phase for target role."""
    target_role_id = role_id or current_user.target_role_id
    if not target_role_id:
        first_role = db.query(JobRole).first()
        target_role_id = first_role.id if first_role else 1

    role = db.query(JobRole).filter(JobRole.id == target_role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    milestones = db.query(RoadmapMilestone).filter(
        RoadmapMilestone.user_id == current_user.id,
        RoadmapMilestone.role_id == role.id
    ).order_by(RoadmapMilestone.phase_number, RoadmapMilestone.id).all()

    # If no milestones exist yet, generate them dynamically
    if not milestones:
        reqs = db.query(RoleSkillRequirement).filter(RoleSkillRequirement.role_id == role.id).all()
        user_skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
        milestones = generate_personalized_roadmap(db, current_user.id, role, reqs, user_skills)

    # Group milestones by phase
    phases_dict = {}
    total_hours = 0
    completed_count = 0

    for m in milestones:
        total_hours += m.estimated_hours
        if m.status == "completed":
            completed_count += 1

        p_num = m.phase_number
        if p_num not in phases_dict:
            phases_dict[p_num] = {
                "phase_number": p_num,
                "phase_title": m.phase_title,
                "total_hours": 0,
                "milestones": []
            }
        phases_dict[p_num]["total_hours"] += m.estimated_hours
        phases_dict[p_num]["milestones"].append(
            RoadmapMilestoneOut(
                id=m.id,
                user_id=m.user_id,
                role_id=m.role_id,
                phase_number=m.phase_number,
                phase_title=m.phase_title,
                title=m.title,
                description=m.description,
                skill_id=m.skill_id,
                skill_name=m.skill.name if m.skill else None,
                target_proficiency=m.target_proficiency,
                estimated_hours=m.estimated_hours,
                status=m.status,
                completed_at=m.completed_at
            )
        )

    phases_out = [
        RoadmapPhaseOut(
            phase_number=data["phase_number"],
            phase_title=data["phase_title"],
            total_hours=data["total_hours"],
            milestones=data["milestones"]
        )
        for data in sorted(phases_dict.values(), key=lambda x: x["phase_number"])
    ]

    total_count = len(milestones)
    completion_pct = round((completed_count / total_count * 100.0), 1) if total_count > 0 else 0.0

    return RoadmapResponse(
        role_id=role.id,
        role_title=role.title,
        total_phases=len(phases_out),
        total_estimated_hours=total_hours,
        total_milestones=total_count,
        completed_milestones=completed_count,
        completion_percentage=completion_pct,
        phases=phases_out
    )

@router.post("/generate", response_model=RoadmapResponse)
def regenerate_roadmap(
    role_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Regenerates the phased learning roadmap based on latest skill profile gaps."""
    target_role_id = role_id or current_user.target_role_id
    role = db.query(JobRole).filter(JobRole.id == target_role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    reqs = db.query(RoleSkillRequirement).filter(RoleSkillRequirement.role_id == role.id).all()
    user_skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()

    generate_personalized_roadmap(db, current_user.id, role, reqs, user_skills)
    return get_roadmap(target_role_id, current_user, db)

@router.patch("/milestones/{milestone_id}", response_model=RoadmapMilestoneOut)
def update_milestone_status(
    milestone_id: int,
    payload: UpdateMilestoneStatusRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update progress status of a roadmap milestone (pending, in_progress, completed)."""
    valid_statuses = ["pending", "in_progress", "completed"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    milestone = db.query(RoadmapMilestone).filter(
        RoadmapMilestone.id == milestone_id,
        RoadmapMilestone.user_id == current_user.id
    ).first()

    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    milestone.status = payload.status
    if payload.status == "completed":
        milestone.completed_at = datetime.datetime.utcnow()
    else:
        milestone.completed_at = None

    db.commit()
    db.refresh(milestone)

    return RoadmapMilestoneOut(
        id=milestone.id,
        user_id=milestone.user_id,
        role_id=milestone.role_id,
        phase_number=milestone.phase_number,
        phase_title=milestone.phase_title,
        title=milestone.title,
        description=milestone.description,
        skill_id=milestone.skill_id,
        skill_name=milestone.skill.name if milestone.skill else None,
        target_proficiency=milestone.target_proficiency,
        estimated_hours=milestone.estimated_hours,
        status=milestone.status,
        completed_at=milestone.completed_at
    )

