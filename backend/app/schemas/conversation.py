from pydantic import BaseModel, Field
from datetime import datetime


class ConversationCreate(BaseModel):
    title: str | None = Field(default=None, max_length=255)


class ConversationResponse(BaseModel):
    id: str
    user_id: str
    title: str | None
    created_at: datetime
    updated_at: datetime