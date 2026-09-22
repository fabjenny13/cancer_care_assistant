from typing import List, Optional, TypedDict

from guardrails import is_flagged, CRISIS_RESPONSE
from llm_client import call_ollama
from rag import build_context

SYSTEM_PROMPT = (
    "You are a warm, supportive companion for cancer patients. "
    "Respond with empathy and validation. Keep replies concise (2-4 sentences). "
    "You are not a therapist or doctor - never give medical advice or diagnoses, "
    "and never guess at treatment details. "
    "If the person seems distressed, acknowledge their feelings before anything else."
)


class ChatResult(TypedDict):
    reply: str
    flagged: bool


def generate_response(
    message: str,
    history: Optional[List[dict]] = None,
) -> ChatResult:
    """Main entry point for the AI core. Call this from anywhere - the FastAPI
    endpoint below, or directly from another teammate's backend code.

    Args:
        message: the patient's latest message.
        history: optional prior turns, each as {"role": "user"|"assistant", "content": "..."}.
                 Pass an empty list or None if you don't have history to include.

    Returns:
        {"reply": str, "flagged": bool} - flagged is True if this message was
        caught by the safety guardrail (crisis language). When flagged is True,
        the caller should also log this to the safety_events table and consider
        triggering a caregiver alert.
    """
    history = history or []

    # Guardrail check runs first, before anything else.
    if is_flagged(message):
        return {"reply": CRISIS_RESPONSE, "flagged": True}

    # Retrieve grounding context from the knowledge base.
    context = build_context(message)

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if context:
        messages.append({
            "role": "system",
            "content": (
                "Here is some verified supportive information that may be "
                "relevant to this conversation. Use it to inform your reply "
                "naturally, in your own words - do not copy it word for word:\n\n"
                f"{context}"
            ),
        })
    for m in history:
        messages.append({"role": m["role"], "content": m["content"]})
    messages.append({"role": "user", "content": message})

    reply = call_ollama(messages)
    return {"reply": reply, "flagged": False}