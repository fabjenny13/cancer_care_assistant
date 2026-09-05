from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.profile import Profile
from app.models.user import User
from app.schemas.profile import ProfileCreate, ProfileResponse


router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


@router.get("", response_model=ProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = (
        db.query(Profile)
        .filter(Profile.user_id == current_user.id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    return ProfileResponse(
        id=str(profile.id),
        user_id=str(profile.user_id),
        name=profile.name,
        age=profile.age,
        cancer_type=profile.cancer_type,
        treatment_stage=profile.treatment_stage
    )


@router.post("", response_model=ProfileResponse)
def create_profile(
    data: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing_profile = (
        db.query(Profile)
        .filter(Profile.user_id == current_user.id)
        .first()
    )

    if existing_profile:
        raise HTTPException(
            status_code=400,
            detail="Profile already exists"
        )

    profile = Profile(
        user_id=current_user.id,
        name=data.name,
        age=data.age,
        cancer_type=data.cancer_type,
        treatment_stage=data.treatment_stage
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return ProfileResponse(
        id=str(profile.id),
        user_id=str(profile.user_id),
        name=profile.name,
        age=profile.age,
        cancer_type=profile.cancer_type,
        treatment_stage=profile.treatment_stage
    )