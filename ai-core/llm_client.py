import requests

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "phi3"  # change to whatever you pulled: mistral, phi3, gemma2, etc.


def call_ollama(messages: list[dict], model: str = MODEL) -> str:
    """Send a chat-style message list to a local Ollama model and return its reply text.

    messages format: [{"role": "system"|"user"|"assistant", "content": "..."}]
    """
    payload = {
        "model": model,
        "messages": messages,
        "stream": False,
    }
    response = requests.post(OLLAMA_URL, json=payload, timeout=120)
    response.raise_for_status()
    data = response.json()
    return data["message"]["content"]