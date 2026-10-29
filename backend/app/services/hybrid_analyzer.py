from typing import List, Dict
from app.models.entities import JobRole, UserSkill, RoleSkillRequirement
from app.schemas.analysis import AnalysisResponse
from app.services.rule_engine import calculate_rule_based_gap
from app.ml.skill_matcher import calculate_nlp_similarity

def perform_hybrid_analysis(
    role: JobRole,
    requirements: List[RoleSkillRequirement],
    user_skills: List[UserSkill]
) -> AnalysisResponse:
    """
    Orchestrates the Dual-Engine analysis:
      1. Deterministic Rule Engine calculation
      2. Genuine NLP TF-IDF Cosine Similarity calculation
      3. Synthesis of composite readiness, estimated effort, and academic defense notes
    """
    # 1. Rule Engine
    rule_metrics, matched_skills, gaps = calculate_rule_based_gap(requirements, user_skills)

    # 2. NLP Engine
    nlp_metrics = calculate_nlp_similarity(role, requirements, user_skills)

    # 3. Composite Readiness Score
    # 60% weight on deterministic skill proof + 40% on semantic textual relevance
    composite_score = round(
        (0.60 * rule_metrics.overall_match_percentage) +
        (0.40 * nlp_metrics.semantic_match_percentage),
        1
    )

    # 4. Readiness Band
    if composite_score >= 80.0:
        readiness_band = "Job Ready (Placement Ready)"
    elif composite_score >= 60.0:
        readiness_band = "Near Ready (Minor Gaps to Close)"
    elif composite_score >= 40.0:
        readiness_band = "Intermediate Gap (Targeted Upskilling Required)"
    else:
        readiness_band = "Foundational Phase (Comprehensive Roadmap Needed)"

    # 5. Estimated Effort Hours Calculation (Transparent and auditable formula)
    base_hours = 0
    for g in gaps:
        if g.gap_type == "critical_missing":
            base_hours += (g.required_level * 18)  # 18 hrs per level required
        elif g.gap_type == "proficiency_deficit":
            base_hours += (g.level_deficit * 12)  # 12 hrs per level to upgrade
        else:
            base_hours += (g.required_level * 10)  # 10 hrs for elective skills

    # Deduct discount for semantic transferable skills if present
    transfer_count = len(nlp_metrics.transferable_skills)
    discount_hours = min(transfer_count * 12, int(base_hours * 0.35))
    total_hours = max(base_hours - discount_hours, 10) if gaps else 0
    estimated_weeks = max(int(round(total_hours / 15.0)), 1) if total_hours > 0 else 0

    # 6. Extract Top Strengths and Urgent Priorities
    top_strengths = [
        f"{m.skill_name} ({'Advanced' if m.user_level >= 3 else 'Intermediate'})"
        for m in sorted(matched_skills, key=lambda x: (x.user_level, x.is_required), reverse=True)[:4]
    ]

    urgent_priorities = [
        f"Master {g.skill_name} (Level {g.required_level}) - {g.importance_rationale}"
        for g in sorted(gaps, key=lambda x: (x.is_required, x.weight), reverse=True)[:4]
    ]

    academic_defense_notes = {
        "rule_engine_rationale": (
            "The rule engine guarantees mathematical predictability and direct accountability for college project "
            "viva evaluation. Every point corresponds to an exact competency level."
        ),
        "nlp_component_rationale": (
            "The NLP engine utilizes TF-IDF and Cosine Distance in high-dimensional vector space. "
            "Unlike superficial keyword matching, it accounts for term frequency, document frequency, and semantic "
            "similarity across technology families without fabricating black-box training sets."
        ),
        "composite_weighting_defense": (
            "Formula: Readiness = 0.60 * RuleScore + 0.40 * NLPScore. "
            "60% represents verified concrete skills, while 40% rewards broader technical vocabulary and transferable concepts."
        ),
        "academic_integrity_declaration": (
            "All metrics are generated dynamically and deterministically. No unverified machine learning labels "
            "or deceptive accuracy claims are introduced."
        )
    }

    return AnalysisResponse(
        role_id=role.id,
        role_title=role.title,
        role_slug=role.slug,
        rule_metrics=rule_metrics,
        nlp_metrics=nlp_metrics,
        composite_readiness_score=composite_score,
        readiness_band=readiness_band,
        estimated_learning_hours=total_hours,
        estimated_learning_weeks=estimated_weeks,
        matched_skills=matched_skills,
        gaps=gaps,
        top_strengths=top_strengths,
        urgent_priorities=urgent_priorities,
        academic_defense_notes=academic_defense_notes
    )

