import requests

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "llama3.2" # change to whatever you pulled: mistral, phi3, gemma2, etc.
KEEP_ALIVE = "10m"
REQUEST_TIMEOUT = (5, 90)
_session = requests.Session()


def call_ollama(messages: list[dict], model: str = MODEL) -> str:
    """Send a chat-style message list to a local Ollama model and return its reply text.

    messages format: [{"role": "system"|"user"|"assistant", "content": "..."}]
    """
    payload = {
        "model": model,
        "messages": messages,
        "stream": False,
        "keep_alive": KEEP_ALIVE,
        "options": {"temperature": 0.4, "num_predict": 320},
    }
    response = _session.post(OLLAMA_URL, json=payload, timeout=REQUEST_TIMEOUT)
    response.raise_for_status()
    data = response.json()
    return data["message"]["content"]

EMBED_URL = "http://localhost:11434/api/embeddings"
EMBED_MODEL = "nomic-embed-text"


def get_embedding(text: str, model: str = EMBED_MODEL) -> list[float]:
    """Turn a piece of text into a vector of numbers representing its meaning."""
    payload = {"model": model, "prompt": text}
    response = _session.post(EMBED_URL, json=payload, timeout=REQUEST_TIMEOUT)
    response.raise_for_status()
    data = response.json()
    return data["embedding"]
