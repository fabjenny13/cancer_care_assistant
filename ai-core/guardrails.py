from llm_client import call_ollama

# Tier 1: fast keyword catch for obvious phrasing.
# NOTE: this list is a starting point for your prototype, not a clinically
# validated list — expand it as you test, and treat false negatives (missed
# crisis language) as far worse than false positives (over-flagging).
CRISIS_KEYWORDS = [
    "want to die",
    "kill myself",
    "end it all",
    "end my life",
    "no reason to live",
    "better off dead",
    "suicide",
    "hurt myself",
    "self harm",
    "can't go on",
    "cant go on",
    "I cant do this anymore" ,
    "I cant suffere anymore" ,
]

CRISIS_RESPONSE = (
    "I'm really glad you told me that, and I want you to know your safety matters most right now. "
    "I'm not able to give you the kind of support you need for this, but please reach out right now: "
    "in India, call the KIRAN mental health helpline at 1800-599-0019 (24/7, free and confidential). "
    "If you're in immediate danger, please contact emergency services or go to the nearest hospital. "
    "Is there someone nearby you trust who you could call right now?"
)

CLASSIFIER_PROMPT = (
    "You are a safety classifier for a healthcare support chatbot. "
    "Only classify as CRISIS if there is a clear expression of wanting to die, "
    "self-harm, or suicide. Ordinary sadness, loneliness, fatigue, or medical "
    "questions are SAFE, even if emotional.\n\n"
    "Examples:\n"
    "'I feel so alone sometimes' -> SAFE\n"
    "'What foods should I avoid during radiation?' -> SAFE\n"
    "'I want to end my life' -> CRISIS\n\n"
    "Answer with exactly one word, CRISIS or SAFE, nothing else.\n\n"
    "Message: {text}"
)
def check_keywords(text: str) -> bool:
    lowered = text.lower()
    return any(kw in lowered for kw in CRISIS_KEYWORDS)


def check_llm_classifier(text: str) -> bool:
    """Second-tier check for rephrased/subtler crisis language the keyword list misses.
    Uses the same local model as a zero-shot classifier."""
    prompt = CLASSIFIER_PROMPT.format(text=text)
    result = call_ollama([{"role": "user", "content": prompt}])
    return "CRISIS" in result.strip().upper()


def is_flagged(text: str) -> bool:
    # Tier 1 first since it's instant and free — only fall through to the
    # slower LLM call if the obvious check doesn't catch anything.
    if check_keywords(text):
        return True
    return check_llm_classifier(text)