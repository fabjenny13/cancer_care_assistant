from typing import List, Optional, TypedDict

from guardrails import is_flagged, CRISIS_RESPONSE
from llm_client import call_ollama
from rag import build_context

SYSTEM_PROMPT = (
    "You are CancerCare Companion, a warm, down-to-earth support companion for people affected by cancer. "
    "Talk like a caring friend who happens to know a lot, not like a form letter. "
    "Reply in 3-5 short sentences of plain, natural prose, with no bullet points, headings or lists. "
    "First respond to how the person feels, in your own words, and do not open every reply with 'I'm sorry to hear'. "
    "If they ask an information question, answer it clearly in simple language using the background information provided, "
    "and say when something depends on their own care team. "
    "End with at most one gentle question or one small suggestion, not both. "
    "Never diagnose, never recommend or change medicines or doses, and never promise outcomes. "
    "If you are not sure, or the information is not provided, say so and suggest they ask their doctor or nurse. "
    "You are a supportive companion, not a doctor or therapist."
)


class ChatResult(TypedDict):
    reply: str
    flagged: bool


def generate_response(
    message: str,
    history: Optional[List[dict]] = None,
    user_context: Optional[str] = None,
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
    context = "" if user_context else build_context(message)

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


    if user_context:
        user_content = (
            f"Here is my health diary from the past week:\n"
            f"{user_context}\n\n"
            f"Using ONLY the diary above, reply in 2-3 sentences. "
            f"Mention at least two specific details from it (like my mood, "
            f"symptoms or appointment). Be kind but honest. "
            f"Do not diagnose or tell me to change medication.\n\n"
            f"My question: {message}"
        )
    else:
        user_content = message
    messages.append({"role": "user", "content": user_content})
    reply = call_ollama(messages)
    return {"reply": reply, "flagged": False}