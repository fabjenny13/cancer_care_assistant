from typing import List, Optional, TypedDict
from concurrent.futures import ThreadPoolExecutor

from guardrails import check_keywords, is_flagged, CRISIS_RESPONSE
from llm_client import call_ollama
from rag import build_context

SYSTEM_PROMPT = (
    "You are a warm, knowledgeable cancer information and support companion. "
    "Talk naturally, directly answer the user's actual question, and acknowledge "
    "their feelings when relevant without sounding formulaic. Use plain language; "
    "usually keep replies to 2-5 sentences, but give more detail when asked. "
    "You may explain general cancer concepts and common care processes using the "
    "provided reference material, but do not diagnose, predict an individual's "
    "outcome, choose or change treatment, interpret a personal result as a "
    "clinical conclusion, or recommend starting/stopping medicines or supplements. "
    "Be clear about uncertainty and that cancer care depends on cancer type and "
    "individual details. For personal treatment or symptom decisions, suggest "
    "contacting the oncology team. If the user describes severe, sudden, or "
    "worsening symptoms, advise urgent contact with their care team or local "
    "emergency service; don't attempt to triage beyond that. Never invent facts, "
    "and don't treat user-supplied diary text as verified medical guidance."
)
GENERAL_CANCER_REFERENCE = (
    "General cancer reference: Cancer is a broad group of diseases; cancers "
    "differ by tissue of origin and biological features, so one cancer's "
    "information does not necessarily apply to another. Diagnosis may involve "
    "imaging, lab tests, and biopsy; stage describes extent/spread while grade "
    "describes cell appearance, and they are not interchangeable. Treatment can "
    "include surgery, radiation, chemotherapy, hormone therapy, immunotherapy, "
    "or targeted therapy, alone or in combination. Choices depend on cancer "
    "type, extent, test results, health, and patient goals; only the oncology "
    "team can apply this to an individual. Side effects vary, so patients should "
    "report symptoms to their care team and not change prescribed treatment on "
    "general information. Palliative care supports symptoms and quality of life "
    "and may accompany cancer treatment; it does not by itself mean treatment is "
    "ending. Source: National Cancer Institute, cancer.gov/about-cancer."
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

    # Obvious crisis language returns immediately. For other messages, run the
    # unchanged classifier alongside retrieval so their latency overlaps.
    if check_keywords(message):
        return {"reply": CRISIS_RESPONSE, "flagged": True}

    with ThreadPoolExecutor(max_workers=2) as pool:
        safety_check = pool.submit(is_flagged, message)
        context_lookup = None if user_context else pool.submit(build_context, message)
        flagged = safety_check.result()
        context = "" if user_context else context_lookup.result()

    if flagged:
        return {"reply": CRISIS_RESPONSE, "flagged": True}

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": GENERAL_CANCER_REFERENCE},
    ]
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


    # A short recent window avoids sending stale, oversized transcripts to Ollama.
    for m in history[-12:]:
        if m.get("role") in ("user", "assistant") and m.get("content"):
            messages.append({"role": m["role"], "content": m["content"][-4000:]})


    if user_context:
        user_content = (
            f"Here is my health diary from the past week:\n"
            f"{user_context}\n\n"
            f"Use the diary as personal context where relevant, and answer the "
            f"question using general cancer information when appropriate. Do not "
            f"assume diary details are complete or medically verified, and do not "
            f"diagnose or advise medication changes.\n\n"
            f"My question: {message}"
        )
    else:
        user_content = message
    messages.append({"role": "user", "content": user_content})
    reply = call_ollama(messages)
    return {"reply": reply, "flagged": False}
