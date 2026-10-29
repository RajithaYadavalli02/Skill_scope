import pytest
from app.models.entities import JobRole, RoleSkillRequirement, UserSkill, Skill
from app.ml.skill_matcher import calculate_nlp_similarity

def test_nlp_cosine_similarity_computation():
    role = JobRole(
        id=1,
        title="Python Developer",
        slug="python-developer",
        department="Engineering",
        description="Scalable backend services using Python, FastAPI, and PostgreSQL",
        overview="Build modern APIs and services",
        key_responsibilities="Develop REST endpoints and manage databases"
    )

    skill_py = Skill(id=1, name="Python", category="Languages")
    skill_api = Skill(id=2, name="FastAPI", category="Frameworks")

    reqs = [
        RoleSkillRequirement(id=1, role_id=1, skill_id=1, is_required=True, required_level=3, weight=1.5, skill=skill_py),
        RoleSkillRequirement(id=2, role_id=1, skill_id=2, is_required=True, required_level=2, weight=1.2, skill=skill_api),
    ]

    user_skills = [
        UserSkill(id=1, user_id=1, skill_id=1, proficiency_level=3, skill=skill_py),
        UserSkill(id=2, user_id=1, skill_id=2, proficiency_level=2, skill=skill_api),
    ]

    nlp_result = calculate_nlp_similarity(role, reqs, user_skills)

    assert 0.0 <= nlp_result.cosine_similarity_score <= 1.0
    assert nlp_result.semantic_match_percentage > 25.0
    assert "TF-IDF" in nlp_result.vector_space_model
    assert len(nlp_result.top_correlated_terms) > 0

def test_transferable_skills_credit():
    role = JobRole(
        id=1,
        title="Backend Developer",
        slug="backend-developer",
        department="Engineering",
        description="Build services with FastAPI and PostgreSQL",
        overview="Backend microservices",
        key_responsibilities="APIs"
    )

    skill_fastapi = Skill(id=2, name="FastAPI", category="Frameworks")
    skill_django = Skill(id=3, name="Django", category="Frameworks")

    reqs = [
        RoleSkillRequirement(id=1, role_id=1, skill_id=2, is_required=True, required_level=2, weight=1.0, skill=skill_fastapi),
    ]

    # User has Django instead of FastAPI (both are in Backend Frameworks cluster)
    user_skills = [
        UserSkill(id=1, user_id=1, skill_id=3, proficiency_level=3, skill=skill_django),
    ]

    nlp_result = calculate_nlp_similarity(role, reqs, user_skills)

    # Verify that transferable credit is captured
    assert len(nlp_result.transferable_skills) >= 1
    assert any("Backend Frameworks" in t["domain"] for t in nlp_result.transferable_skills)

