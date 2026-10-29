from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import User

def get_current_user(db: Session = Depends(get_db)) -> User:
    """
    Returns the primary active student user for SkillScope.
    Initializes a default student record if one does not exist yet.
    """
    user = db.query(User).first()
    if not user:
        user = User(
            name="Arun Sharma",
            email="arun.student@skillscope.edu",
            education_level="B.Tech Computer Science & Engineering",
            years_of_experience=1.0
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

