# InMem_RAG.py

import os
from dotenv import load_dotenv

from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core.settings import Settings
from llama_index.core import StorageContext, load_index_from_storage
from llama_index.core import PromptTemplate


# ---------------- LOAD ENV ----------------
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# ---------------- EMBEDDING MODEL ----------------
Settings.embed_model = OpenAIEmbedding(
    model="text-embedding-3-small"
)

# ---------------- LOAD DOCUMENTS ----------------
documents = SimpleDirectoryReader("data").load_data()
print([doc.metadata.get("file_name") for doc in documents])

# ---------------- CREATE OR LOAD INDEX ----------------
PERSIST_DIR = "./storage_InMem"

# if not os.path.exists(PERSIST_DIR):
#     print("🔹 Creating new index...")
#     index = VectorStoreIndex.from_documents(documents)
#     index.storage_context.persist(persist_dir=PERSIST_DIR)
# else:
#     print("🔹 Loading existing index...")
#     storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
#     index = load_index_from_storage(storage_context)

print("🔹 Creating index...")

# ---------------- In-memory RAG setup ---------------- 
index = VectorStoreIndex.from_documents(documents)
index.storage_context.persist(persist_dir=PERSIST_DIR)

# ---------------- QUERY ----------------

qa_prompt = PromptTemplate(
    """
You are an intelligent assistant.
Use ONLY the context provided below to answer the question.
If the answer is not present, say "I don't know".

---------------------
Context:
{context_str}
---------------------

Question:
{query_str}

Answer:
"""
)

query_engine = index.as_query_engine(similarity_top_k=3,text_qa_template=qa_prompt)
response = query_engine.query("Tell me about Dheeraj education background and his past and current companies, experience duration in table in CSM")

print("\n--- Answer ---")
print(response)
