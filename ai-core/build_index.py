import os
import json
import numpy as np
import faiss
from llm_client import get_embedding

KB_DIR = "knowledge_base"
INDEX_FILE = "kb_index.faiss"
METADATA_FILE = "kb_metadata.json"


def load_documents():
    docs = []
    for filename in sorted(os.listdir(KB_DIR)):
        if filename.endswith(".txt"):
            path = os.path.join(KB_DIR, filename)
            with open(path, "r", encoding="utf-8") as f:
                text = f.read()
            docs.append({"filename": filename, "text": text})
    return docs


def build():
    docs = load_documents()
    print(f"Found {len(docs)} documents")

    embeddings = []
    metadata = []
    for doc in docs:
        print(f"Embedding {doc['filename']}...")
        emb = get_embedding(doc["text"])
        embeddings.append(emb)
        metadata.append({"filename": doc["filename"], "text": doc["text"]})

    embeddings_np = np.array(embeddings, dtype="float32")
    dimension = embeddings_np.shape[1]

    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings_np)
    faiss.write_index(index, INDEX_FILE)

    with open(METADATA_FILE, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"Index built with {index.ntotal} vectors, dimension {dimension}")


if __name__ == "__main__":
    build()