from typing import List, Optional

from fastapi import FastAPI
from pydantic import BaseModel

from guardrails import is_flagged, CRISIS_RESPONSE
from llm_client import call_ollama

app = FastAPI(title="CancerCare Companion - AI Core")

SYSTEM_PROMPT = (
    "You are a warm, supportive companion for cancer patients. "
    "Respond with empathy and validation. Keep replies concise (2-4 sentences). "
    "You are not a therapist or doctor - never give medical advice or diagnoses, "
    "and never guess at treatment details. "
    "If the person seems distressed, acknowledge their feelings before anything else."
)


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    reply: str
    flagged: bool


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    # Step 3: guardrail check runs BEFORE the message reaches the main model.
    if is_flagged(req.message):
        return ChatResponse(reply=CRISIS_RESPONSE, flagged=True)

    # Step 2: bare chat loop — build the message list and call the model.
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for m in req.history:
        messages.append({"role": m.role, "content": m.content})
    messages.append({"role": "user", "content": req.message})

    reply = call_ollama(messages)
    return ChatResponse(reply=reply, flagged=False)


@app.get("/health")
def health():
    return {"status": "ok"}