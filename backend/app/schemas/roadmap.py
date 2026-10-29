from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class RoadmapMilestoneBase(BaseModel):
    phase_number: int
    phase_title: str
    title: str
    description: str
    skill_id: Optional[int] = None
    skill_name: Optional[str] = None
    target_proficiency: int = 2
    estimated_hours: int = 15
    status: str = "pending"  # "pending", "in_progress", "completed"

class RoadmapMilestoneOut(RoadmapMilestoneBase):
    id: int
    user_id: int
    role_id: int
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RoadmapPhaseOut(BaseModel):
    phase_number: int
    phase_title: str
    total_hours: int
    milestones: List[RoadmapMilestoneOut]

class RoadmapResponse(BaseModel):
    role_id: int
    role_title: str
    total_phases: int
    total_estimated_hours: int
    total_milestones: int
    completed_milestones: int
    completion_percentage: float
    phases: List[RoadmapPhaseOut]

class UpdateMilestoneStatusRequest(BaseModel):
    status: str  # "pending", "in_progress", "completed"

