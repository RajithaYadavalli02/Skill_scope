import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine, SessionLocal
from app.services.seed_service import seed_database

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()
    yield

client = TestClient(app)

def test_api_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "SkillScope API is online"
    assert data["supported_roles"] == 9

def test_roles_catalogue_has_9_roles():
    response = client.get("/api/v1/roles")
    assert response.status_code == 200
    roles = response.json()
    assert len(roles) == 9
    titles = [r["title"] for r in roles]
    assert "Python Developer" in titles
    assert "Full Stack Developer" in titles
    assert "Data Analyst" in titles
    assert "Data Scientist" in titles
    assert "Machine Learning Engineer" in titles
    assert "AI Engineer" in titles
    assert "Frontend Developer" in titles
    assert "Backend Developer" in titles
    assert "Software Tester / QA Engineer" in titles

def test_user_profile_crud():
    # 1. Fetch profile
    get_res = client.get("/api/v1/profile")
    assert get_res.status_code == 200
    profile = get_res.json()
    assert "name" in profile

    # 2. Update profile
    put_res = client.put("/api/v1/profile", json={"name": "Test Engineer", "years_of_experience": 2.0})
    assert put_res.status_code == 200
    assert put_res.json()["name"] == "Test Engineer"

def test_dual_engine_analysis():
    response = client.get("/api/v1/analysis")
    assert response.status_code == 200
    data = response.json()
    assert "rule_metrics" in data
    assert "nlp_metrics" in data
    assert "composite_readiness_score" in data
    assert "readiness_band" in data
    assert "academic_defense_notes" in data

    # Verify rule metrics structure
    assert "overall_match_percentage" in data["rule_metrics"]
    assert "core_skills_match_percentage" in data["rule_metrics"]

    # Verify NLP metrics structure
    assert "cosine_similarity_score" in data["nlp_metrics"]
    assert "vector_space_model" in data["nlp_metrics"]

def test_compare_all_roles():
    response = client.get("/api/v1/analysis/compare-all")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 9

def test_roadmap_endpoint():
    response = client.get("/api/v1/roadmap")
    assert response.status_code == 200
    data = response.json()
    assert "phases" in data
    assert len(data["phases"]) >= 1

def test_resources_endpoint():
    response = client.get("/api/v1/resources")
    assert response.status_code == 200
    resources = response.json()
    assert len(resources) > 0

