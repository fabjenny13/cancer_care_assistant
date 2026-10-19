import json
import numpy as np
import faiss
from llm_client import get_embedding

INDEX_FILE = "kb_index.faiss"
METADATA_FILE = "kb_metadata.json"


def load_index():
    index = faiss.read_index(INDEX_FILE)
    with open(METADATA_FILE, "r", encoding="utf-8") as f:
        metadata = json.load(f)
    return index, metadata


def retrieve(query: str, top_k: int = 3):
    index, metadata = load_index()
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


if __name__ == "__main__":
    query = input("Enter a test question: ")
    results = retrieve(query)
    print(f"\nTop {len(results)} matches:\n")
    for r in results:
        print(f"[{r['filename']}] (distance: {r['distance']:.2f})")
        print(r["text"] + "\n")