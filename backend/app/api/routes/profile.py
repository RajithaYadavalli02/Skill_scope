from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import User, Skill, UserSkill, JobRole, RoleSkillRequirement
from app.schemas.profile import (
    UserProfileOut,
    UserProfileUpdate,
    UserSkillOut,
    UserSkillCreate,
    UserSkillUpdate,
    SkillOut,
)
from app.services.seed_service import PERSONA_PRESETS
from app.services.roadmap_generator import generate_personalized_roadmap

router = APIRouter(prefix="/profile", tags=["User Profile"])

@router.get("", response_model=UserProfileOut)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve the current user's profile and acquired skills."""
    skills_out = [
        UserSkillOut(
            id=us.id,
            skill_id=us.skill_id,
            skill_name=us.skill.name if us.skill else "Unknown",
            category=us.skill.category if us.skill else "General",
            proficiency_level=us.proficiency_level,
            years_experience=us.years_experience,
            created_at=us.created_at
        )
        for us in current_user.skills
    ]

    target_role_title = current_user.target_role.title if current_user.target_role else None

    return UserProfileOut(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        education_level=current_user.education_level,
        years_of_experience=current_user.years_of_experience,
        target_role_id=current_user.target_role_id,
        target_role_title=target_role_title,
        skills=skills_out
    )

@router.put("", response_model=UserProfileOut)
def update_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update student basic information or active target career role."""
    if payload.name is not None:
        current_user.name = payload.name
    if payload.education_level is not None:
        current_user.education_level = payload.education_level
    if payload.years_of_experience is not None:
        current_user.years_of_experience = payload.years_of_experience
    if payload.target_role_id is not None:
        role = db.query(JobRole).filter(JobRole.id == payload.target_role_id).first()
        if not role:
            raise HTTPException(status_code=404, detail="Target job role not found")
        current_user.target_role_id = role.id

    db.commit()
    db.refresh(current_user)
    return get_profile(current_user, db)

@router.get("/skills/catalog", response_model=List[SkillOut])
def get_all_skills(db: Session = Depends(get_db)):
    """Retrieve full master catalog of tech skills for selection."""
    return db.query(Skill).order_by(Skill.category, Skill.name).all()

@router.post("/skills", response_model=UserSkillOut)
def add_user_skill(
    payload: UserSkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a new skill or update proficiency if already present."""
    skill = db.query(Skill).filter(Skill.id == payload.skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    existing = db.query(UserSkill).filter(
        UserSkill.user_id == current_user.id,
        UserSkill.skill_id == payload.skill_id
    ).first()

    if existing:
        existing.proficiency_level = payload.proficiency_level
        existing.years_experience = payload.years_experience
        db.commit()
        db.refresh(existing)
        target = existing
    else:
        new_us = UserSkill(
            user_id=current_user.id,
            skill_id=payload.skill_id,
            proficiency_level=payload.proficiency_level,
            years_experience=payload.years_experience
        )
        db.add(new_us)
        db.commit()
        db.refresh(new_us)
        target = new_us

    return UserSkillOut(
        id=target.id,
        skill_id=target.skill_id,
        skill_name=skill.name,
        category=skill.category,
        proficiency_level=target.proficiency_level,
        years_experience=target.years_experience,
        created_at=target.created_at
    )

@router.put("/skills/{user_skill_id}", response_model=UserSkillOut)
def update_user_skill(
    user_skill_id: int,
    payload: UserSkillUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update proficiency level or experience years for an existing skill."""
    target = db.query(UserSkill).filter(
        UserSkill.id == user_skill_id,
        UserSkill.user_id == current_user.id
    ).first()

    if not target:
        raise HTTPException(status_code=404, detail="User skill entry not found")

    target.proficiency_level = payload.proficiency_level
    target.years_experience = payload.years_experience
    db.commit()
    db.refresh(target)

    return UserSkillOut(
        id=target.id,
        skill_id=target.skill_id,
        skill_name=target.skill.name if target.skill else "Unknown",
        category=target.skill.category if target.skill else "General",
        proficiency_level=target.proficiency_level,
        years_experience=target.years_experience,
        created_at=target.created_at
    )

@router.delete("/skills/{user_skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_skill(
    user_skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a skill from the user profile."""
    target = db.query(UserSkill).filter(
        UserSkill.id == user_skill_id,
        UserSkill.user_id == current_user.id
    ).first()

    if not target:
        raise HTTPException(status_code=404, detail="User skill not found")

    db.delete(target)
    db.commit()
    return None

@router.get("/presets")
def get_persona_presets():
    """Retrieve available 1-click viva presentation personas."""
    return PERSONA_PRESETS

@router.post("/presets/{preset_id}/apply", response_model=UserProfileOut)
def apply_preset(
    preset_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    1-Click demonstration helper: Replaces user skills with the selected preset persona,
    sets the target career track, and regenerates roadmap.
    """
    selected_preset = next((p for p in PERSONA_PRESETS if p["id"] == preset_id), None)
    if not selected_preset:
        raise HTTPException(status_code=404, detail=f"Preset '{preset_id}' not found")

    # Set target role
    target_role = db.query(JobRole).filter(JobRole.slug == selected_preset["target_role_slug"]).first()
    if target_role:
        current_user.target_role_id = target_role.id

    current_user.education_level = selected_preset["education_level"]
    current_user.years_of_experience = selected_preset["years_of_experience"]

    # Clear current skills
    db.query(UserSkill).filter(UserSkill.user_id == current_user.id).delete()
    db.commit()

    # Populate preset skills
    for s_info in selected_preset["skills"]:
        skill = db.query(Skill).filter(Skill.name == s_info["skill_name"]).first()
        if skill:
            new_us = UserSkill(
                user_id=current_user.id,
                skill_id=skill.id,
                proficiency_level=s_info["proficiency_level"],
                years_experience=s_info["years_experience"]
            )
            db.add(new_us)

    db.commit()
    db.refresh(current_user)

    # Regenerate roadmap
    if target_role:
        reqs = db.query(RoleSkillRequirement).filter(RoleSkillRequirement.role_id == target_role.id).all()
        user_skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
        generate_personalized_roadmap(db, current_user.id, target_role, reqs, user_skills)

    return get_profile(current_user, db)

