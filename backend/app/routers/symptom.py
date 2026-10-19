import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.symptom import SymptomLog
from app.models.user import User
from app.schemas.symptom import (
    SymptomCreate,
    SymptomResponse,
    SymptomUpdate
)


router = APIRouter(
    prefix="/symptoms",
    tags=["Symptoms"]
)


def get_owned_symptom(
    symptom_id: uuid.UUID,
    current_user: User,
    db: Session
) -> SymptomLog:
    symptom = (
        db.query(SymptomLog)
        .filter(
            SymptomLog.id == symptom_id,
            SymptomLog.user_id == current_user.id
        )
        .first()
    )

    if not symptom:
        raise HTTPException(
            status_code=404,
            detail="Symptom not found"
        )

    return symptom


@router.post("", response_model=SymptomResponse)
def create_symptom(
    data: SymptomCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    symptom = SymptomLog(
        user_id=current_user.id,
        **data.model_dump()
    )

    db.add(symptom)
    db.commit()
    db.refresh(symptom)

    return symptom


@router.get("", response_model=list[SymptomResponse])
def get_symptoms(
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(SymptomLog).filter(
        SymptomLog.user_id == current_user.id
    )

    if from_date:
        query = query.filter(SymptomLog.logged_on >= from_date)

    if to_date:
        query = query.filter(SymptomLog.logged_on <= to_date)

    return (
        query
        .order_by(
            SymptomLog.logged_on.desc(),
            SymptomLog.created_at.desc()
        )
        .all()
    )


@router.patch("/{symptom_id}", response_model=SymptomResponse)
def update_symptom(
    symptom_id: uuid.UUID,
    data: SymptomUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    symptom = get_owned_symptom(symptom_id, current_user, db)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(symptom, field, value)

    db.commit()
    db.refresh(symptom)

    return symptom


@router.delete("/{symptom_id}")
def delete_symptom(
    symptom_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    symptom = get_owned_symptom(symptom_id, current_user, db)

    db.delete(symptom)
    db.commit()

    # JSON body (not 204): the frontend's apiRequest() always calls
    # response.json(), which would throw on an empty response.
    return {"message": "Symptom deleted"}
