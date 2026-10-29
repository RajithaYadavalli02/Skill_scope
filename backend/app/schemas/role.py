from typing import Optional, List
from pydantic import BaseModel
from app.schemas.profile import SkillOut

class RoleSkillRequirementOut(BaseModel):
    id: int
    skill_id: int
    skill_name: str
    category: str
    is_required: bool
    required_level: int
    weight: float
    importance_rationale: Optional[str] = None

    class Config:
        from_attributes = True

class JobRoleSummaryOut(BaseModel):
    id: int
    title: str
    slug: str
    department: str
    market_demand: str
    salary_range: str
    description: str
    total_skills_count: int = 0
    core_skills_count: int = 0

    class Config:
        from_attributes = True

class JobRoleDetailOut(BaseModel):
    id: int
    title: str
    slug: str
    department: str
    market_demand: str
    salary_range: str
    description: str
    overview: Optional[str] = None
    key_responsibilities: Optional[str] = None
    requirements: List[RoleSkillRequirementOut] = []

    class Config:
        from_attributes = True

