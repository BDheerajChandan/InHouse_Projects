# Faiss_RAG.py
import os
from dotenv import load_dotenv

from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core.settings import Settings
from llama_index.core import StorageContext, load_index_from_storage
from llama_index.core import PromptTemplate
import faiss

# ---------------- LOAD ENV ----------------
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# ---------------- EMBEDDING MODEL ----------------
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")

# ---------------- LOAD DOCUMENTS ----------------
DATA_DIR="./data"
input_files = [os.path.join(DATA_DIR, f) for f in os.listdir(DATA_DIR) 
               if os.path.isfile(os.path.join(DATA_DIR, f))]
print(input_files)
documents = SimpleDirectoryReader(
    input_files=input_files
).load_data()

print(f"Loaded documents: {[doc.metadata.get('file_name') for doc in documents]}")

# ---------------- CREATE OR LOAD INDEX WITH FAISS ----------------
PERSIST_DIR = "./storage_Faiss_Claude"

try:
    # Try the correct import after installing the package
    from llama_index.vector_stores.faiss import FaissVectorStore
    
    FAISS_INDEX_FILE = os.path.join(PERSIST_DIR, "faiss.index")
    
    if not os.path.exists(PERSIST_DIR):
        os.makedirs(PERSIST_DIR)
    
    # if not os.path.exists(FAISS_INDEX_FILE):
    #     print("🔹 Creating new FAISS vector index...")
    #     dimension = 1536  # embedding dimension for text-embedding-3-small
    #     faiss_index = faiss.IndexFlatL2(dimension)
    #     vector_store = FaissVectorStore(faiss_index=faiss_index)
    #     storage_context = StorageContext.from_defaults(vector_store=vector_store)
        
    #     index = VectorStoreIndex.from_documents(
    #         documents,
    #         storage_context=storage_context
    #     )
    #     # Persist FAISS + metadata
    #     index.storage_context.persist(persist_dir=PERSIST_DIR)
    #     print("✅ FAISS index saved to storage.")
    # else:
    #     print("🔹 Loading existing FAISS index from storage...")
    #     # Load FAISS index
    #     d = 1536
    #     faiss_index = faiss.read_index(FAISS_INDEX_FILE)
    #     vector_store = FaissVectorStore(faiss_index=faiss_index)
    #     storage_context = StorageContext.from_defaults(
    #         vector_store=vector_store,
    #         persist_dir=PERSIST_DIR
        # )
        # index = load_index_from_storage(storage_context)
        # print("✅ FAISS index loaded.")
    print("🔹 Creating new FAISS vector index...")
    dimension = 1536  # embedding dimension for text-embedding-3-small
    faiss_index = faiss.IndexFlatL2(dimension)
    vector_store = FaissVectorStore(faiss_index=faiss_index)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
      
    index = VectorStoreIndex.from_documents(
        documents,
        storage_context=storage_context
    )
    # Persist FAISS + metadata
    index.storage_context.persist(persist_dir=PERSIST_DIR)
    print("✅ FAISS index saved to storage.")

except ImportError:
    print("⚠️ FAISS vector store not available. Using default in-memory storage.")
    print("   Install with: pip install llama-index-vector-stores-faiss")
    
    # Fallback to in-memory
    if not os.path.exists(PERSIST_DIR):
        os.makedirs(PERSIST_DIR)
        print("🔹 Creating new in-memory index...")
        index = VectorStoreIndex.from_documents(documents)
        index.storage_context.persist(persist_dir=PERSIST_DIR)
    else:
        print("🔹 Loading existing index...")
        storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
        index = load_index_from_storage(storage_context)

# ---------------- QUERY ENGINE ----------------
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

# ---------------- QUERY ----------------
response = query_engine.query("Tell me about Dheeraj education background and past companies")

print("\n--- Answer ---")
print(response)