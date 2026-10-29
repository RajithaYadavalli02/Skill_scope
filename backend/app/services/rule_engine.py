from typing import List, Dict, Tuple
from app.models.entities import RoleSkillRequirement, UserSkill
from app.schemas.analysis import RuleEngineMetrics, GapItem, MatchedSkillItem

def calculate_rule_based_gap(
    requirements: List[RoleSkillRequirement],
    user_skills: List[UserSkill]
) -> Tuple[RuleEngineMetrics, List[MatchedSkillItem], List[GapItem]]:
    """
    Deterministic rule-based skill gap evaluation.
    Evaluates:
      1. Exact skill match ratios
      2. Core (mandatory) vs Elective (nice-to-have) weighted fulfillment
      3. Proficiency level deficits (P_user - P_required)
    """
    user_skill_map: Dict[int, int] = {us.skill_id: us.proficiency_level for us in user_skills}

    core_weights_total = 0.0
    core_weighted_earned = 0.0
    elective_weights_total = 0.0
    elective_weighted_earned = 0.0

    matched_items: List[MatchedSkillItem] = []
    gap_items: List[GapItem] = []

    total_required_skills = 0
    matched_required_skills = 0
    missing_critical_count = 0
    proficiency_deficit_count = 0

    for req in requirements:
        weight = req.weight or 1.0
        req_level = req.required_level
        user_level = user_skill_map.get(req.skill_id, 0)
        skill_name = req.skill.name if req.skill else f"Skill #{req.skill_id}"
        category = req.skill.category if req.skill else "General"

        # Ratio achieved for this individual skill (capped at 1.0 for matching score)
        skill_ratio = min(user_level, req_level) / max(req_level, 1)

        if req.is_required:
            total_required_skills += 1
            core_weights_total += weight
            core_weighted_earned += weight * skill_ratio

            if user_level >= req_level:
                matched_required_skills += 1
            elif user_level == 0:
                missing_critical_count += 1
            else:
                proficiency_deficit_count += 1
        else:
            elective_weights_total += weight
            elective_weighted_earned += weight * skill_ratio
            if 0 < user_level < req_level:
                proficiency_deficit_count += 1

        # Categorize into Matched vs Gap
        if user_level >= req_level:
            matched_items.append(
                MatchedSkillItem(
                    skill_id=req.skill_id,
                    skill_name=skill_name,
                    category=category,
                    is_required=req.is_required,
                    required_level=req_level,
                    user_level=user_level,
                    meets_or_exceeds=True,
                    match_percentage=round(min(user_level / req_level * 100, 100.0), 1)
                )
            )
        elif user_level > 0:
            # Partial match with deficit
            deficit = req_level - user_level
            gap_items.append(
                GapItem(
                    skill_id=req.skill_id,
                    skill_name=skill_name,
                    category=category,
                    is_required=req.is_required,
                    required_level=req_level,
                    user_level=user_level,
                    level_deficit=deficit,
                    gap_type="proficiency_deficit",
                    weight=weight,
                    importance_rationale=req.importance_rationale or f"Advance from level {user_level} to {req_level}"
                )
            )
        else:
            # Completely missing
            gap_type = "critical_missing" if req.is_required else "elective_missing"
            gap_items.append(
                GapItem(
                    skill_id=req.skill_id,
                    skill_name=skill_name,
                    category=category,
                    is_required=req.is_required,
                    required_level=req_level,
                    user_level=0,
                    level_deficit=req_level,
                    gap_type=gap_type,
                    weight=weight,
                    importance_rationale=req.importance_rationale or ("Mandatory industry core competence" if req.is_required else "Desirable secondary skill")
                )
            )

    core_match_pct = (core_weighted_earned / core_weights_total * 100.0) if core_weights_total > 0 else 100.0
    elective_match_pct = (elective_weighted_earned / elective_weights_total * 100.0) if elective_weights_total > 0 else 100.0

    # Composite rule score: 75% core weight, 25% elective weight (if electives exist)
    if elective_weights_total > 0:
        overall_match_pct = (0.75 * core_match_pct) + (0.25 * elective_match_pct)
    else:
        overall_match_pct = core_match_pct

    formula_explanation = (
        "Deterministic Formula: Overall = (0.75 * CoreWeightedMatch%) + (0.25 * ElectiveWeightedMatch%). "
        "Each skill fulfillment is computed as min(UserLevel, RequiredLevel) / RequiredLevel."
    )

    metrics = RuleEngineMetrics(
        overall_match_percentage=round(overall_match_pct, 1),
        core_skills_match_percentage=round(core_match_pct, 1),
        elective_skills_match_percentage=round(elective_match_pct, 1),
        total_required_skills=total_required_skills,
        matched_required_skills=matched_required_skills,
        missing_critical_count=missing_critical_count,
        proficiency_deficit_count=proficiency_deficit_count,
        formula_explanation=formula_explanation
    )

    return metrics, matched_items, gap_items

