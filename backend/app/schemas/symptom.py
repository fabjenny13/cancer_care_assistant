import uuid
from datetime import date, datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints


Severity = Literal["Mild", "Moderate", "Severe"]

SymptomName = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=100)
]


class SymptomCreate(BaseModel):
    symptom: SymptomName
    severity: Severity
    logged_on: date
    notes: str | None = Field(default=None, max_length=2000)


class SymptomUpdate(BaseModel):
    # PATCH: only fields that are sent get changed. The required
    # fields default to None but still reject an explicit null.
    symptom: SymptomName = None
    severity: Severity = None
    logged_on: date = None
    notes: str | None = Field(default=None, max_length=2000)


class SymptomResponse(SymptomCreate):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
