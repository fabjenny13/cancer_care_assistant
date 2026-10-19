import uuid
from datetime import date, datetime, time
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints


AppointmentType = Literal[
    "Consultation",
    "Follow-up",
    "Treatment",
    "Test / Scan",
    "Other"
]

Doctor = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=150)
]


class AppointmentCreate(BaseModel):
    doctor: Doctor
    hospital: str | None = Field(default=None, max_length=150)
    appointment_date: date
    appointment_time: time
    appointment_type: AppointmentType
    notes: str | None = Field(default=None, max_length=2000)


class AppointmentUpdate(BaseModel):
    # PATCH: only fields that are sent get changed. The required
    # fields default to None but still reject an explicit null.
    doctor: Doctor = None
    hospital: str | None = Field(default=None, max_length=150)
    appointment_date: date = None
    appointment_time: time = None
    appointment_type: AppointmentType = None
    notes: str | None = Field(default=None, max_length=2000)


class AppointmentResponse(AppointmentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
