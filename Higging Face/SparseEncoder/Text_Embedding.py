from sentence_transformers import SparseEncoder

# 1. Load a pretrained SparseEncoder model
print(" ============= Started ============ ")
print("Loading a Model")
model = SparseEncoder("naver/splade-cocondenser-ensembledistil")
print("Model Loaded")

# The sentences to encode
sentences = [
    "The weather is lovely today.",
    "It's so sunny outside!",
    "He drove to the stadium.",
]
print("sentences : ",sentences)

# 2. Calculate sparse embeddings by calling model.encode()
print("Finding the embeddings")
embeddings = model.encode(sentences)
print("embeddings : ",embeddings)
print("embeddings.shape : ",embeddings.shape)
# [3, 30522] - sparse representation with vocabulary size dimensions

# 3. Calculate the embedding similarities (using dot product by default)
print("Finding the similarities ")
similarities = model.similarity(embeddings, embeddings)
print("similarities : ",similarities)

# 4. Check sparsity statistics
stats = SparseEncoder.sparsity(embeddings)
print("Sparsity statistics : ",stats)
print(f"Sparsity: {stats['sparsity_ratio']:.2%}")  
print(f"Avg non-zero dimensions per embedding: {stats['active_dims']:.2f}")