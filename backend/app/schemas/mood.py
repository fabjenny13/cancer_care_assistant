import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


# Labels used by the frontend's mood picker -> 1..5 score
MOOD_SCORES = {
    "very low": 1,
    "low": 2,
    "neutral": 3,
    "good": 4,
    "very good": 5,
}


class MoodCreate(BaseModel):
    emotion: str = Field(min_length=1, max_length=50)
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    distress_score: float | None = Field(default=None, ge=0.0, le=10.0)
    message_id: uuid.UUID | None = None

    # New: manual check-ins from the Mood page
    mood_score: int | None = Field(default=None, ge=1, le=5)
    note: str | None = Field(default=None, max_length=1000)
    source: Literal["MANUAL", "AI"] = "MANUAL"

    @model_validator(mode="after")
    def derive_mood_score(self):
        # For manual check-ins, fill in the 1-5 score from the label
        # ("Very Low" -> 1) so the client doesn't have to send both.
        if self.source == "MANUAL" and self.mood_score is None:
            self.mood_score = MOOD_SCORES.get(self.emotion.strip().lower())

        return self


class MoodResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    message_id: uuid.UUID | None
    emotion: str
    confidence: float | None
    distress_score: float | None
    mood_score: int | None
    note: str | None
    source: str
    created_at: datetime
