import os
import pickle
import faiss
from sentence_transformers import SentenceTransformer
from pypdf import PdfReader

# ================== CONFIG ==================
DATA_DIR = "data"
DB_DIR = "vector_db_True"
EMBED_MODEL = "all-MiniLM-L6-v2"

FAISS_INDEX_PATH = os.path.join(DB_DIR, "faiss.index")
METADATA_PATH = os.path.join(DB_DIR, "metadata.pkl")

os.makedirs(DB_DIR, exist_ok=True)

# ================== CHUNK FUNCTION ==================
def chunk_text(text, chunk_size=500, overlap=100):
    chunks = []
    start = 0
    while start < len(text):
        chunks.append(text[start:start + chunk_size])
        start += chunk_size - overlap
    return chunks


# ================== LOAD DOCUMENTS ==================
def load_documents():
    documents = []

    for file in os.listdir(DATA_DIR):
        path = os.path.join(DATA_DIR, file)

        if file.endswith(".txt"):
            with open(path, "r", encoding="utf-8") as f:
                text = f.read()
                documents.extend(chunk_text(text))

        elif file.endswith(".pdf"):
            reader = PdfReader(path)
            full_text = ""
            for page in reader.pages:
                full_text += page.extract_text() or ""
            documents.extend(chunk_text(full_text))

    return documents


# ================== BUILD & SAVE VECTOR DB ==================
def build_vector_db():
    print("📄 Loading documents...")
    documents = load_documents()

    print(f"📄 Total chunks: {len(documents)}")

    print("🔢 Creating embeddings...")
    model = SentenceTransformer(EMBED_MODEL)
    embeddings = model.encode(documents, convert_to_numpy=True)

    print("💾 Saving FAISS index...")
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)

    faiss.write_index(index, FAISS_INDEX_PATH)

    with open(METADATA_PATH, "wb") as f:
        pickle.dump(documents, f)

    print("✅ Vector DB saved successfully!")


# ================== LOAD VECTOR DB ==================
def load_vector_db():
    print("📦 Loading vector database...")

    index = faiss.read_index(FAISS_INDEX_PATH)

    with open(METADATA_PATH, "rb") as f:
        documents = pickle.load(f)

    model = SentenceTransformer(EMBED_MODEL)

    return index, documents, model


# ================== QUERY SEARCH ==================
def query_rag(query, top_k=3):
    index, documents, model = load_vector_db()

    query_embedding = model.encode([query])
    distances, indices = index.search(query_embedding, top_k)

    print("\n🔍 Top Results:\n")
    for i, idx in enumerate(indices[0]):
        print(f"Result {i+1} | Score: {distances[0][i]:.4f}")
        print(documents[idx][:500])
        print("-" * 60)


# ================== MAIN ==================
if __name__ == "__main__":

    # # Build DB only if not exists
    # if not os.path.exists(FAISS_INDEX_PATH):
    #     build_vector_db()
    build_vector_db()

    while True:
        query = input("\nAsk your question (or type 'exit'): ")
        if query.lower() == "exit":
            break
        query_rag(query)
