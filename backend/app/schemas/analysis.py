from typing import Optional, List, Dict
from pydantic import BaseModel

class GapItem(BaseModel):
    skill_id: int
    skill_name: str
    category: str
    is_required: bool
    required_level: int
    user_level: int
    level_deficit: int
    gap_type: str  # "critical_missing", "elective_missing", "proficiency_deficit", "transferable_bonus"
    weight: float
    importance_rationale: Optional[str] = None

class MatchedSkillItem(BaseModel):
    skill_id: int
    skill_name: str
    category: str
    is_required: bool
    required_level: int
    user_level: int
    meets_or_exceeds: bool
    match_percentage: float

class RuleEngineMetrics(BaseModel):
    overall_match_percentage: float
    core_skills_match_percentage: float
    elective_skills_match_percentage: float
    total_required_skills: int
    matched_required_skills: int
    missing_critical_count: int
    proficiency_deficit_count: int
    formula_explanation: str

class NLPEngineMetrics(BaseModel):
    cosine_similarity_score: float  # 0.0 to 1.0
    semantic_match_percentage: float  # 0.0% to 100.0%
    vector_space_model: str  # "TF-IDF (Sublinear TF + Bi-grams) + Cosine Distance"
    top_correlated_terms: List[str]
    transferable_skills: List[Dict[str, str]]
    methodology_and_limitations: str

class AnalysisResponse(BaseModel):
    role_id: int
    role_title: str
    role_slug: str
    rule_metrics: RuleEngineMetrics
    nlp_metrics: NLPEngineMetrics
    composite_readiness_score: float  # Weighted combination
    readiness_band: str  # "Job Ready", "Near Ready", "Intermediate Gap", "Significant Upskilling Needed"
    estimated_learning_hours: int
    estimated_learning_weeks: int
    matched_skills: List[MatchedSkillItem]
    gaps: List[GapItem]
    top_strengths: List[str]
    urgent_priorities: List[str]
    academic_defense_notes: Dict[str, str]

