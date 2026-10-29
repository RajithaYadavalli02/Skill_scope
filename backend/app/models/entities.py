import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), default="Student Engineer")
    email = Column(String(120), default="student@skillscope.edu")
    target_role_id = Column(Integer, ForeignKey("job_roles.id"), nullable=True)
    education_level = Column(String(100), default="Undergraduate (B.Tech / B.E. / B.Sc)")
    years_of_experience = Column(Float, default=0.5)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    target_role = relationship("JobRole", foreign_keys=[target_role_id])
    milestones = relationship("RoadmapMilestone", back_populates="user", cascade="all, delete-orphan")
    history = relationship("AnalysisHistory", back_populates="user", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(50), nullable=False)  # Languages, Frameworks, Databases, Tools, etc.
    description = Column(Text, nullable=True)
    aliases = Column(String(200), nullable=True)  # Comma-separated: "postgres,postgresql"

    # Relationships
    user_skills = relationship("UserSkill", back_populates="skill")
    role_requirements = relationship("RoleSkillRequirement", back_populates="skill")
    resources = relationship("LearningResource", back_populates="skill")


class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    proficiency_level = Column(Integer, default=1)  # 1: Beginner, 2: Intermediate, 3: Advanced, 4: Expert
    years_experience = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="skills")
    skill = relationship("Skill", back_populates="user_skills")


class JobRole(Base):
    __tablename__ = "job_roles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    department = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    overview = Column(Text, nullable=True)
    key_responsibilities = Column(Text, nullable=True)
    market_demand = Column(String(50), default="High")  # Very High, High, Moderate
    salary_range = Column(String(100), default="₹6 LPA - ₹18 LPA / $70k - $120k")

    # Relationships
    requirements = relationship("RoleSkillRequirement", back_populates="role", cascade="all, delete-orphan")


class RoleSkillRequirement(Base):
    __tablename__ = "role_skill_requirements"

    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("job_roles.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    is_required = Column(Boolean, default=True)  # True = Mandatory / Core, False = Nice to Have
    required_level = Column(Integer, default=2)  # 1: Beginner, 2: Intermediate, 3: Advanced, 4: Expert
    weight = Column(Float, default=1.0)
    importance_rationale = Column(String(255), nullable=True)

    # Relationships
    role = relationship("JobRole", back_populates="requirements")
    skill = relationship("Skill", back_populates="role_requirements")


class LearningResource(Base):
    __tablename__ = "learning_resources"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    title = Column(String(200), nullable=False)
    url = Column(String(500), nullable=False)
    provider = Column(String(100), nullable=False)  # official_docs, freecodecamp, coursera, etc.
    resource_type = Column(String(50), default="Documentation")  # Documentation, Course, Video, Project
    difficulty = Column(String(50), default="Beginner")  # Beginner, Intermediate, Advanced
    is_free = Column(Boolean, default=True)

    # Relationships
    skill = relationship("Skill", back_populates="resources")


class RoadmapMilestone(Base):
    __tablename__ = "roadmap_milestones"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("job_roles.id"), nullable=False)
    phase_number = Column(Integer, default=1)  # 1: Foundations, 2: Frameworks, 3: Production & Projects
    phase_title = Column(String(150), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True)
    target_proficiency = Column(Integer, default=2)
    estimated_hours = Column(Integer, default=20)
    status = Column(String(50), default="pending")  # pending, in_progress, completed
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="milestones")
    skill = relationship("Skill")


class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("job_roles.id"), nullable=False)
    rule_score = Column(Float, nullable=False)
    nlp_score = Column(Float, nullable=False)
    hybrid_score = Column(Float, nullable=False)
    matched_skills_count = Column(Integer, default=0)
    critical_gaps_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="history")
    role = relationship("JobRole")

