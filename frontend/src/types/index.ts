export interface SkillMaster {
  id: number;
  name: string;
  category: string;
  description?: string;
  aliases?: string;
}

export interface UserSkill {
  id: number;
  skill_id: number;
  skill_name: string;
  category: string;
  proficiency_level: number; // 1-4
  years_experience: number;
  created_at?: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  education_level: string;
  years_of_experience: number;
  target_role_id?: number | null;
  target_role_title?: string | null;
  skills: UserSkill[];
}

export interface RoleSkillRequirement {
  id: number;
  skill_id: number;
  skill_name: string;
  category: string;
  is_required: boolean;
  required_level: number;
  weight: number;
  importance_rationale?: string;
}

export interface JobRoleSummary {
  id: number;
  title: string;
  slug: string;
  department: string;
  market_demand: string;
  salary_range: string;
  description: string;
  total_skills_count: number;
  core_skills_count: number;
}

export interface JobRoleDetail {
  id: number;
  title: string;
  slug: string;
  department: string;
  market_demand: string;
  salary_range: string;
  description: string;
  overview?: string;
  key_responsibilities?: string;
  requirements: RoleSkillRequirement[];
}

export interface GapItem {
  skill_id: number;
  skill_name: string;
  category: string;
  is_required: boolean;
  required_level: number;
  user_level: number;
  level_deficit: number;
  gap_type: 'critical_missing' | 'elective_missing' | 'proficiency_deficit' | 'transferable_bonus';
  weight: number;
  importance_rationale?: string;
}

export interface MatchedSkillItem {
  skill_id: number;
  skill_name: string;
  category: string;
  is_required: boolean;
  required_level: number;
  user_level: number;
  meets_or_exceeds: boolean;
  match_percentage: number;
}

export interface RuleMetrics {
  overall_match_percentage: number;
  core_skills_match_percentage: number;
  elective_skills_match_percentage: number;
  total_required_skills: number;
  matched_required_skills: number;
  missing_critical_count: number;
  proficiency_deficit_count: number;
  formula_explanation: string;
}

export interface TransferableSkillCredit {
  target_skill: string;
  transferable_from: string;
  domain: string;
  credit_ratio: string;
  rationale: string;
}

export interface NLPMetrics {
  cosine_similarity_score: number;
  semantic_match_percentage: number;
  vector_space_model: string;
  top_correlated_terms: string[];
  transferable_skills: TransferableSkillCredit[];
  methodology_and_limitations: string;
}

export interface AnalysisResponse {
  role_id: number;
  role_title: string;
  role_slug: string;
  rule_metrics: RuleMetrics;
  nlp_metrics: NLPMetrics;
  composite_readiness_score: number;
  readiness_band: string;
  estimated_learning_hours: number;
  estimated_learning_weeks: number;
  matched_skills: MatchedSkillItem[];
  gaps: GapItem[];
  top_strengths: string[];
  urgent_priorities: string[];
  academic_defense_notes: Record<string, string>;
}

export interface RoleComparisonItem {
  role_id: number;
  title: string;
  slug: string;
  department: string;
  market_demand: string;
  composite_readiness_score: number;
  rule_match_pct: number;
  nlp_semantic_pct: number;
  readiness_band: string;
  missing_critical_count: number;
  estimated_weeks: number;
}

export interface RoadmapMilestone {
  id: number;
  user_id: number;
  role_id: number;
  phase_number: number;
  phase_title: string;
  title: string;
  description: string;
  skill_id?: number | null;
  skill_name?: string | null;
  target_proficiency: number;
  estimated_hours: number;
  status: 'pending' | 'in_progress' | 'completed';
  completed_at?: string | null;
}

export interface RoadmapPhase {
  phase_number: number;
  phase_title: string;
  total_hours: number;
  milestones: RoadmapMilestone[];
}

export interface RoadmapResponse {
  role_id: number;
  role_title: string;
  total_phases: number;
  total_estimated_hours: number;
  total_milestones: number;
  completed_milestones: number;
  completion_percentage: number;
  phases: RoadmapPhase[];
}

export interface LearningResource {
  id: number;
  skill_id: number;
  skill_name: string;
  skill_category: string;
  title: string;
  url: string;
  provider: string;
  resource_type: string;
  difficulty: string;
  is_free: boolean;
}

export interface ProgressSummary {
  user_name: string;
  target_role_id: number;
  target_role_title: string;
  composite_readiness_score: number;
  rule_match_pct: number;
  nlp_semantic_pct: number;
  readiness_band: string;
  total_skills_acquired: number;
  total_milestones: number;
  completed_milestones: number;
  in_progress_milestones: number;
  completion_percentage: number;
  hours_invested: number;
  missing_critical_count: number;
}

export interface ProgressHistoryItem {
  id: number;
  role_id: number;
  role_title: string;
  rule_score: number;
  nlp_score: number;
  hybrid_score: number;
  matched_skills_count: number;
  critical_gaps_count: number;
  created_at: string;
}

export interface PersonaPreset {
  id: string;
  name: string;
  tagline: string;
  target_role_slug: string;
  education_level: string;
  years_of_experience: number;
  skills: Array<{
    skill_name: string;
    proficiency_level: number;
    years_experience: number;
  }>;
}
