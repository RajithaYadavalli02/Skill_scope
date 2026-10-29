
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.entities import (
    RoadmapMilestone,
    JobRole,
    RoleSkillRequirement,
    UserSkill,
)
from app.services.hybrid_analyzer import perform_hybrid_analysis


def generate_personalized_roadmap(
    db: Session,
    user_id: int,
    role: JobRole,
    requirements: List[RoleSkillRequirement],
    user_skills: List[UserSkill],
) -> List[RoadmapMilestone]:
    """Create or safely update a personalized three-phase roadmap."""

    analysis = perform_hybrid_analysis(role, requirements, user_skills)

    existing = (
        db.query(RoadmapMilestone)
        .filter(
            RoadmapMilestone.user_id == user_id,
            RoadmapMilestone.role_id == role.id,
        )
        .all()
    )

    # Match existing milestones so saved progress is preserved.
    existing_map = {
        (m.phase_number, m.skill_id, m.title): m
        for m in existing
    }

    used_ids = set()
    planned: List[RoadmapMilestone] = []

    critical_missing = [
        gap for gap in analysis.gaps
        if gap.gap_type == "critical_missing"
    ]
    proficiency_deficits = [
        gap for gap in analysis.gaps
        if gap.gap_type == "proficiency_deficit"
    ]
    elective_missing = [
        gap for gap in analysis.gaps
        if gap.gap_type == "elective_missing"
    ]

    def add_milestone(
        phase_number: int,
        phase_title: str,
        title: str,
        description: str,
        skill_id: Optional[int],
        target_proficiency: int,
        estimated_hours: int,
    ) -> None:
        key = (phase_number, skill_id, title)
        milestone = existing_map.get(key)

        if milestone is None:
            milestone = RoadmapMilestone(
                user_id=user_id,
                role_id=role.id,
                phase_number=phase_number,
                phase_title=phase_title,
                title=title,
                description=description,
                skill_id=skill_id,
                target_proficiency=target_proficiency,
                estimated_hours=estimated_hours,
                status="pending",
            )
            db.add(milestone)
        else:
            # Update details without resetting status or completion time.
            milestone.phase_title = phase_title
            milestone.description = description
            milestone.target_proficiency = target_proficiency
            milestone.estimated_hours = estimated_hours

            if milestone.id is not None:
                used_ids.add(milestone.id)

        planned.append(milestone)

    # Phase 1: Critical foundations
    phase1 = critical_missing[:3]

    if phase1:
        for gap in phase1:
            add_milestone(
                1,
                "Phase 1: Critical Core Foundations",
                f"Master Core {gap.skill_name}",
                (
                    f"Learn essential {gap.skill_name} concepts and build "
                    f"two exercises to reach Level {gap.required_level}."
                ),
                gap.skill_id,
                gap.required_level,
                max(gap.required_level * 18, 12),
            )
    else:
        add_milestone(
            1,
            "Phase 1: Critical Core Foundations",
            f"Review and Deepen {role.title} Fundamentals",
            (
                f"Review core syntax, best practices, and architecture "
                f"for {role.title}."
            ),
            requirements[0].skill_id if requirements else None,
            3,
            15,
        )

    # Phase 2: Proficiency gaps and remaining critical gaps
    phase2 = (proficiency_deficits + critical_missing[3:])[:4]

    if phase2:
        for gap in phase2:
            add_milestone(
                2,
                "Phase 2: Framework Mastery & Tooling Deep Dive",
                f"Bridge Proficiency Gap: {gap.skill_name}",
                (
                    f"Improve {gap.skill_name} from Level {gap.user_level} "
                    f"to Level {gap.required_level}."
                ),
                gap.skill_id,
                gap.required_level,
                max(gap.level_deficit * 12, 12),
            )
    else:
        add_milestone(
            2,
            "Phase 2: Framework Mastery & Tooling Deep Dive",
            f"Advance Framework Capabilities for {role.title}",
            "Build robust components or services with clean architecture.",
            None,
            3,
            20,
        )

    # Phase 3: Elective skills
    for gap in elective_missing[:2]:
        add_milestone(
            3,
            "Phase 3: Production Deployment, Testing & Capstone",
            f"Elective Competence: {gap.skill_name}",
            (
                f"Learn {gap.skill_name} and integrate it into "
                "a practical project."
            ),
            gap.skill_id,
            gap.required_level,
            max(gap.required_level * 10, 10),
        )

    # Phase 3: Capstone project
    add_milestone(
        3,
        "Phase 3: Production Deployment, Testing & Capstone",
        f"Build and Deploy Industry-Grade {role.title} Capstone Project",
        f"Design, test, and deploy a showcase project for {role.title}.",
        None,
        4,
        30,
    )

    # Preserve completed milestones even if they are no longer generated.
    for milestone in existing:
        if milestone.id not in used_ids and milestone not in planned:
            if milestone.status == "completed":
                planned.append(milestone)
            else:
                db.delete(milestone)

    try:
        db.commit()

        for milestone in planned:
            db.refresh(milestone)

        return planned

    except Exception:
        db.rollback()
        raise
