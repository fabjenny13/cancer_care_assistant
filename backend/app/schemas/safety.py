from datetime import datetime

from pydantic import BaseModel, Field


class SafetyEventCreate(BaseModel):
    event_type: str = Field(min_length=1, max_length=100)
    severity: str
    description: str = Field(min_length=1)
    message_id: str | None = None


class SafetyEventResponse(BaseModel):
    id: str
    user_id: str
    message_id: str | None
    event_type: str
    severity: str
    status: str
    description: str
    created_at: datetime
    updated_at: datetime
    resolved_at: datetime | None


class SafetyEventUpdate(BaseModel):
    status: str