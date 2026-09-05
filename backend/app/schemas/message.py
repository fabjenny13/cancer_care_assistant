from datetime import datetime
from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
    content: str = Field(min_length=1)


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender: str
    content: str
    created_at: datetime