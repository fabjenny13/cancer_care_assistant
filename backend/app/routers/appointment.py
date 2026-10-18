import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.appointment import Appointment
from app.models.user import User
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentResponse,
    AppointmentUpdate
)


router = APIRouter(
    prefix="/appointments",
    tags=["Appointments"]
)


def get_owned_appointment(
    appointment_id: uuid.UUID,
    current_user: User,
    db: Session
) -> Appointment:
    appointment = (
        db.query(Appointment)
        .filter(
            Appointment.id == appointment_id,
            Appointment.user_id == current_user.id
        )
        .first()
    )

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found"
        )

    return appointment


@router.post("", response_model=AppointmentResponse)
def create_appointment(
    data: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    appointment = Appointment(
        user_id=current_user.id,
        **data.model_dump()
    )

    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return appointment


@router.get("", response_model=list[AppointmentResponse])
def get_appointments(
    # Pass from_date=<today> to get only upcoming appointments. The
    # client supplies "today" so it matches the user's own timezone.
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Appointment).filter(
        Appointment.user_id == current_user.id
    )

    if from_date:
        query = query.filter(Appointment.appointment_date >= from_date)

    if to_date:
        query = query.filter(Appointment.appointment_date <= to_date)

    return (
        query
        .order_by(
            Appointment.appointment_date.asc(),
            Appointment.appointment_time.asc()
        )
        .all()
    )


@router.patch("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: uuid.UUID,
    data: AppointmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    appointment = get_owned_appointment(appointment_id, current_user, db)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(appointment, field, value)

    db.commit()
    db.refresh(appointment)

    return appointment


@router.delete("/{appointment_id}")
def delete_appointment(
    appointment_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    appointment = get_owned_appointment(appointment_id, current_user, db)

    db.delete(appointment)
    db.commit()

    # JSON body (not 204): the frontend's apiRequest() always calls
    # response.json(), which would throw on an empty response.
    return {"message": "Appointment deleted"}
