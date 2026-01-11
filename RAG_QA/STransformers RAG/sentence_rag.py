import os
import faiss
from sentence_transformers import SentenceTransformer
from pypdf import PdfReader

# ---------------- CONFIG ----------------
DATA_DIR = "data"
EMBED_MODEL = "all-MiniLM-L6-v2"

# ---------------- LOAD FILES ----------------
documents = []

for file in os.listdir(DATA_DIR):
    print(file)
    path = os.path.join(DATA_DIR, file)

    if file.endswith(".txt"):
        with open(path, "r", encoding="utf-8") as f:
            documents.append(f.read())

    elif file.endswith(".pdf"):
        reader = PdfReader(path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        documents.append(text)

print(f"Loaded {len(documents)} documents")

# ---------------- EMBEDDING MODEL ----------------
model = SentenceTransformer(EMBED_MODEL)

# Convert docs → embeddings
embeddings = model.encode(documents, convert_to_numpy=True)

# ---------------- FAISS INDEX ----------------
dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(embeddings)

# ---------------- QUERY ----------------

# prompt = f"""
# Answer the question using the context below.

# Context:
# {documents[indices[0][0]]}

# Question:
# Tell me about Dheeraj education and experience.

# Answer:
# """

# print(prompt)

query = "Tell me about Dheeraj LinkedIn Url"
query_embedding = model.encode([query])

# Search
k = 1
distances, indices = index.search(query_embedding, k)

prompt = f"""
Answer the question using the context below.

Context:
{documents[indices[0][0]]}

Question:
Tell me about Dheeraj education and experience.

Answer:
"""

print(prompt)
from llama_cpp import Llama

llm = Llama(model_path="models/llama-3-8b.Q4_K_M.gguf")

response = llm(prompt, max_tokens=300)
print(response["choices"][0]["text"])
# pip install llama-cpp-python


print("\n🔍 Answer from documents:\n")
for idx in indices[0]:
    print(documents[idx][:])
    print("------")
