import uuid
from datetime import datetime, time
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, StringConstraints


Frequency = Literal[
    "Once daily",
    "Twice daily",
    "Three times daily",
    "As needed"
]


MedicationName = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=150)
]

Dosage = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=100)
]


class MedicationCreate(BaseModel):
    name: MedicationName
    dosage: Dosage
    frequency: Frequency
    time_of_day: time


class MedicationUpdate(BaseModel):
    # PATCH: only fields that are sent get changed. The required
    # fields default to None but still reject an explicit null.
    name: MedicationName = None
    dosage: Dosage = None
    frequency: Frequency = None
    time_of_day: time = None


class MedicationTakenUpdate(BaseModel):
    taken: bool


class MedicationResponse(MedicationCreate):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    last_taken_at: datetime | None
    created_at: datetime
    updated_at: datetime
