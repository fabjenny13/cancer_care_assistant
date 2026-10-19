import json
import numpy as np
import faiss
from llm_client import get_embedding

INDEX_FILE = "kb_index.faiss"
METADATA_FILE = "kb_metadata.json"

_index = None
_metadata = None


def _load():
    """Load the FAISS index and metadata once, then reuse them for every request."""
    global _index, _metadata
    if _index is None:
        _index = faiss.read_index(INDEX_FILE)
        with open(METADATA_FILE, "r", encoding="utf-8") as f:
            _metadata = json.load(f)
    return _index, _metadata


def retrieve(query: str, top_k: int = 3):
    index, metadata = _load()
    query_embedding = np.array([get_embedding(query)], dtype="float32")
    distances, indices = index.search(query_embedding, top_k)

    results = []
    for rank, idx in enumerate(indices[0]):
        results.append({
            "filename": metadata[idx]["filename"],
            "text": metadata[idx]["text"],
            "distance": float(distances[0][rank]),
        })
    return results


def build_context(query: str, top_k: int = 3) -> str:
    """Return the most relevant knowledge base entries as one text block,
    ready to hand to the LLM as grounding context."""
    results = retrieve(query, top_k=top_k)
    if not results:
        return ""
    chunks = [r["text"] for r in results]
    return "\n\n---\n\n".join(chunks)