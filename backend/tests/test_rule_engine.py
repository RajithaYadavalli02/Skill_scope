import pytest
from app.models.entities import RoleSkillRequirement, UserSkill, Skill
from app.services.rule_engine import calculate_rule_based_gap

def test_full_match_scenario():
    # Setup test skills
    skill1 = Skill(id=1, name="Python", category="Languages")
    skill2 = Skill(id=2, name="FastAPI", category="Frameworks")

    req1 = RoleSkillRequirement(id=1, role_id=1, skill_id=1, is_required=True, required_level=3, weight=1.0, skill=skill1)
    req2 = RoleSkillRequirement(id=2, role_id=1, skill_id=2, is_required=True, required_level=2, weight=1.0, skill=skill2)

    user_skills = [
        UserSkill(id=1, user_id=1, skill_id=1, proficiency_level=3, skill=skill1),
        UserSkill(id=2, user_id=1, skill_id=2, proficiency_level=2, skill=skill2),
    ]

    metrics, matched, gaps = calculate_rule_based_gap([req1, req2], user_skills)

    assert metrics.overall_match_percentage == 100.0
    assert metrics.missing_critical_count == 0
    assert metrics.proficiency_deficit_count == 0
    assert len(matched) == 2
    assert len(gaps) == 0

def test_zero_match_scenario():
    skill1 = Skill(id=1, name="Python", category="Languages")
    req1 = RoleSkillRequirement(id=1, role_id=1, skill_id=1, is_required=True, required_level=3, weight=1.0, skill=skill1)

    metrics, matched, gaps = calculate_rule_based_gap([req1], [])

    assert metrics.overall_match_percentage == 0.0
    assert metrics.missing_critical_count == 1
    assert len(matched) == 0
    assert len(gaps) == 1
    assert gaps[0].gap_type == "critical_missing"

def test_partial_proficiency_deficit():
    skill1 = Skill(id=1, name="Python", category="Languages")
    req1 = RoleSkillRequirement(id=1, role_id=1, skill_id=1, is_required=True, required_level=4, weight=1.0, skill=skill1)

    # User has level 2 out of required 4 -> 50% match
    user_skills = [UserSkill(id=1, user_id=1, skill_id=1, proficiency_level=2, skill=skill1)]

    metrics, matched, gaps = calculate_rule_based_gap([req1], user_skills)

    assert metrics.overall_match_percentage == 50.0
    assert metrics.proficiency_deficit_count == 1
    assert gaps[0].gap_type == "proficiency_deficit"
    assert gaps[0].level_deficit == 2

