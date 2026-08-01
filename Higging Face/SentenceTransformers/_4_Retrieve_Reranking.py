from sentence_transformers import SentenceTransformer

print(" ========= Started ========= ")
print("Loading a Model")
model = SentenceTransformer("sentence-transformers/multi-qa-mpnet-base-dot-v1")
print("Model Loaded")

documents = [
    "My first paragraph. That contains information",
    "Python is a programming language.",
]
print("documents : ",documents)
print("Embeddings for documents")
document_embeddings = model.encode(documents)
print("document_embeddings : ",document_embeddings)

query = "What is Python?"
print("query : ",query)
query_embedding = model.encode(query)
print("query_embedding : ",query_embedding)