import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.medication import Medication
from app.models.user import User
from app.schemas.medication import (
    MedicationCreate,
    MedicationResponse,
    MedicationTakenUpdate,
    MedicationUpdate
)


router = APIRouter(
    prefix="/medications",
    tags=["Medications"]
)


def get_owned_medication(
    medication_id: uuid.UUID,
    current_user: User,
    db: Session
) -> Medication:
    medication = (
        db.query(Medication)
        .filter(
            Medication.id == medication_id,
            Medication.user_id == current_user.id
        )
        .first()
    )

    if not medication:
        raise HTTPException(
            status_code=404,
            detail="Medication not found"
        )

    return medication


@router.post("", response_model=MedicationResponse)
def create_medication(
    data: MedicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    medication = Medication(
        user_id=current_user.id,
        **data.model_dump()
    )

    db.add(medication)
    db.commit()
    db.refresh(medication)

    return medication


@router.get("", response_model=list[MedicationResponse])
def get_medications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(Medication)
        .filter(Medication.user_id == current_user.id)
        .order_by(
            Medication.time_of_day.asc(),
            Medication.created_at.asc()
        )
        .all()
    )


@router.patch("/{medication_id}", response_model=MedicationResponse)
def update_medication(
    medication_id: uuid.UUID,
    data: MedicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    medication = get_owned_medication(medication_id, current_user, db)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(medication, field, value)

    db.commit()
    db.refresh(medication)

    return medication


@router.put(
    "/{medication_id}/taken",
    response_model=MedicationResponse
)
def set_medication_taken(
    medication_id: uuid.UUID,
    data: MedicationTakenUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    medication = get_owned_medication(medication_id, current_user, db)

    # taken=true stamps the time (using the database clock);
    # taken=false clears it.
    medication.last_taken_at = func.now() if data.taken else None

    db.commit()
    db.refresh(medication)

    return medication


@router.delete("/{medication_id}")
def delete_medication(
    medication_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    medication = get_owned_medication(medication_id, current_user, db)

    db.delete(medication)
    db.commit()

    # JSON body (not 204): the frontend's apiRequest() always calls
    # response.json(), which would throw on an empty response.
    return {"message": "Medication deleted"}
