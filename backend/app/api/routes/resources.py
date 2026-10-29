from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import LearningResource, Skill, JobRole, RoleSkillRequirement
from app.schemas.resource import ResourceOut

router = APIRouter(prefix="/resources", tags=["Learning Resource Library"])

@router.get("", response_model=List[ResourceOut])
def list_resources(
    skill_id: Optional[int] = Query(None, description="Filter resources by Skill ID"),
    role_slug: Optional[str] = Query(None, description="Filter resources relevant to a specific role"),
    resource_type: Optional[str] = Query(None, description="Filter by type: Documentation, Course, Video, Project, Book"),
    search: Optional[str] = Query(None, description="Search keyword in title or provider"),
    db: Session = Depends(get_db)
):
    """Retrieve curated learning resources with optional filtering."""
    query = db.query(LearningResource).join(Skill, LearningResource.skill_id == Skill.id)

    if skill_id:
        query = query.filter(LearningResource.skill_id == skill_id)

    if role_slug:
        role = db.query(JobRole).filter(JobRole.slug == role_slug).first()
        if role:
            skill_ids = [req.skill_id for req in role.requirements]
            query = query.filter(LearningResource.skill_id.in_(skill_ids))

    if resource_type:
        query = query.filter(LearningResource.resource_type.ilike(f"%{resource_type}%"))

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (LearningResource.title.ilike(search_filter)) |
            (LearningResource.provider.ilike(search_filter)) |
            (Skill.name.ilike(search_filter))
        )

    resources = query.order_by(Skill.name, LearningResource.title).all()

    return [
        ResourceOut(
            id=res.id,
            skill_id=res.skill_id,
            skill_name=res.skill.name if res.skill else "General",
            skill_category=res.skill.category if res.skill else "General",
            title=res.title,
            url=res.url,
            provider=res.provider,
            resource_type=res.resource_type,
            difficulty=res.difficulty,
            is_free=res.is_free
        )
        for res in resources
    ]

