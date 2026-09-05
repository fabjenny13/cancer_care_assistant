from datetime import datetime

from pydantic import BaseModel, Field


class MoodCreate(BaseModel):
    emotion: str = Field(min_length=1, max_length=50)
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    distress_score: float | None = Field(default=None, ge=0.0, le=10.0)
    message_id: str | None = None


class MoodResponse(BaseModel):
    id: str
    user_id: str
    message_id: str | None
    emotion: str
    confidence: float | None
    distress_score: float | None
    created_at: datetime