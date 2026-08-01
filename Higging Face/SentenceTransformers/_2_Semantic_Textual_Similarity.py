from sentence_transformers import SentenceTransformer,SimilarityFunction

print(" ============ Started ============= ")
print("Loading a Model")
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
# model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2", similarity_fn_name=SimilarityFunction.DOT_PRODUCT)
print("Model Loaded")

# Two lists of sentences
sentences1 = [
    "The new movie is awesome",
    "The cat sits outside",
    "A man is playing guitar",
]

sentences2 = [
    "The dog plays in the garden",
    "The new movie is so great",
    "A woman watches TV",
]
print("sentences1 : ",sentences1)
print("sentences2 : ",sentences2)

# Compute embeddings for both lists
print("embeddings loading for sentences1")
embeddings1 = model.encode(sentences1)
print("embeddings1 : ",embeddings1)

print("embeddings loading for sentences1")
embeddings2 = model.encode(sentences2)
print("embeddings2 : ",embeddings2)

# Compute cosine similarities
similarities_1 = model.similarity(embeddings1, embeddings2)
print("similarities_1 : ",similarities_1)

# Output the pairs with their score
for idx_i, sentence1 in enumerate(sentences1):
    print(sentence1)
    for idx_j, sentence2 in enumerate(sentences2):
        print(f" - {sentence2: <30}: {similarities_1[idx_i][idx_j]:.4f}")
        
similarities_2 = model.similarity(embeddings1, embeddings1)
print("similarities_2 : ",similarities_2)

# Change the similarity function to Manhattan distance
model.similarity_fn_name = SimilarityFunction.MANHATTAN
print("model.similarity_fn_name : ",model.similarity_fn_name)

similarities_3 = model.similarity(embeddings1, embeddings1)
print("similarities_3 : ",similarities_3)