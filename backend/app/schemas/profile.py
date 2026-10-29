from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class SkillBase(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    aliases: Optional[str] = None

class SkillOut(SkillBase):
    id: int
    class Config:
        from_attributes = True

class UserSkillCreate(BaseModel):
    skill_id: int
    proficiency_level: int = Field(ge=1, le=4, description="1: Beginner, 2: Intermediate, 3: Advanced, 4: Expert")
    years_experience: float = Field(default=1.0, ge=0.0)

class UserSkillUpdate(BaseModel):
    proficiency_level: int = Field(ge=1, le=4)
    years_experience: float = Field(default=1.0, ge=0.0)

class UserSkillOut(BaseModel):
    id: int
    skill_id: int
    skill_name: str
    category: str
    proficiency_level: int
    years_experience: float
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    education_level: Optional[str] = None
    years_of_experience: Optional[float] = None
    target_role_id: Optional[int] = None

class UserProfileOut(BaseModel):
    id: int
    name: str
    email: str
    education_level: str
    years_of_experience: float
    target_role_id: Optional[int]
    target_role_title: Optional[str]
    skills: List[UserSkillOut] = []

    class Config:
        from_attributes = True

class PersonaPreset(BaseModel):
    id: str
    name: str
    tagline: str
    target_role_slug: str
    education_level: str
    years_of_experience: float
    skills: List[UserSkillCreate]

