from typing import Optional
from pydantic import BaseModel

class ResourceOut(BaseModel):
    id: int
    skill_id: int
    skill_name: str
    skill_category: str
    title: str
    url: str
    provider: str
    resource_type: str
    difficulty: str
    is_free: bool

    class Config:
        from_attributes = True

class ProgressHistoryOut(BaseModel):
    id: int
    role_id: int
    role_title: str
    rule_score: float
    nlp_score: float
    hybrid_score: float
    matched_skills_count: int
    critical_gaps_count: int
    created_at: str

    class Config:
        from_attributes = True

