from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import JobRole, RoleSkillRequirement
from app.schemas.role import JobRoleSummaryOut, JobRoleDetailOut, RoleSkillRequirementOut

router = APIRouter(prefix="/roles", tags=["Job Roles Catalogue"])

@router.get("", response_model=List[JobRoleSummaryOut])
def list_roles(db: Session = Depends(get_db)):
    """List all 9 supported industry job roles with demand and salary benchmarks."""
    roles = db.query(JobRole).order_by(JobRole.id).all()
    results = []
    for r in roles:
        core_count = sum(1 for req in r.requirements if req.is_required)
        results.append(
            JobRoleSummaryOut(
                id=r.id,
                title=r.title,
                slug=r.slug,
                department=r.department,
                market_demand=r.market_demand,
                salary_range=r.salary_range,
                description=r.description,
                total_skills_count=len(r.requirements),
                core_skills_count=core_count
            )
        )
    return results

@router.get("/{identifier}", response_model=JobRoleDetailOut)
def get_role_detail(identifier: str, db: Session = Depends(get_db)):
    """Retrieve in-depth requirements for a specific role by ID or slug."""
    if identifier.isdigit():
        role = db.query(JobRole).filter(JobRole.id == int(identifier)).first()
    else:
        role = db.query(JobRole).filter(JobRole.slug == identifier).first()

    if not role:
        raise HTTPException(status_code=404, detail="Job role not found")

    reqs_out = [
        RoleSkillRequirementOut(
            id=req.id,
            skill_id=req.skill_id,
            skill_name=req.skill.name if req.skill else "Unknown",
            category=req.skill.category if req.skill else "General",
            is_required=req.is_required,
            required_level=req.required_level,
            weight=req.weight,
            importance_rationale=req.importance_rationale
        )
        for req in sorted(role.requirements, key=lambda x: (not x.is_required, -x.weight))
    ]

    return JobRoleDetailOut(
        id=role.id,
        title=role.title,
        slug=role.slug,
        department=role.department,
        market_demand=role.market_demand,
        salary_range=role.salary_range,
        description=role.description,
        overview=role.overview,
        key_responsibilities=role.key_responsibilities,
        requirements=reqs_out
    )

