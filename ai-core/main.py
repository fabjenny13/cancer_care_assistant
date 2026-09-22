from typing import List, Optional

from fastapi import FastAPI
from pydantic import BaseModel

from core import generate_response

app = FastAPI(title="CancerCare Companion - AI Core")


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    reply: str
    flagged: bool


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    history = [{"role": m.role, "content": m.content} for m in req.history]
    result = generate_response(req.message, history)
    return ChatResponse(**result)


@app.get("/health")
def health():
    return {"status": "ok"}