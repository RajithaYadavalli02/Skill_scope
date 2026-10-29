from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.services.seed_service import seed_database
from app.api.routes import (
    profile,
    roles,
    analysis,
    roadmap,
    resources,
    progress,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables
    Base.metadata.create_all(bind=engine)
    # Seed standard initial data
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="SkillScope API",
    description="Backend API for SkillScope - AI-Powered Job Skill Gap Analyzer & Personalized Career Roadmap System",
    version=settings.PROJECT_VERSION,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(profile.router, prefix=settings.API_V1_STR)
app.include_router(roles.router, prefix=settings.API_V1_STR)
app.include_router(analysis.router, prefix=settings.API_V1_STR)
app.include_router(roadmap.router, prefix=settings.API_V1_STR)
app.include_router(resources.router, prefix=settings.API_V1_STR)
app.include_router(progress.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "SkillScope API is online",
        "documentation": "/docs",
        "version": settings.PROJECT_VERSION,
        "supported_roles": 9,
        "academic_modules": [
            "Rule-Based Calculation Engine",
            "NLP TF-IDF Vector Space & Cosine Similarity Engine",
            "Dynamic 3-Phase Roadmap Synthesizer",
            "Curated Resource Library",
            "Continuous Progress Tracker"
        ]
    }

