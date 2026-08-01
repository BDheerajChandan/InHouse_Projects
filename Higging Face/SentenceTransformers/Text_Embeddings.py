from sentence_transformers import SentenceTransformer
# 1. Load a pretrained Sentence Transformer model

print(" ================ Starting ================ ")
print("Loading the Model")
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
print("Model loaded")

# The sentences to encode
sentences = [
    "The weather is lovely today.",
    "It's so sunny outside!",
    "He drove to the stadium.",
]
print("sentences : ",sentences)

# 2. Calculate embeddings by calling model.encode()
print("Starting the embeddings")
embeddings = model.encode(sentences)
print("Embedding sentences : ",embeddings)
print("embeddings.shape : ",embeddings.shape)

# 3. Calculate the embedding similarities (Similarity matrix with each sentence)
similarities = model.similarity(embeddings, embeddings)
print("similarities : ",similarities)