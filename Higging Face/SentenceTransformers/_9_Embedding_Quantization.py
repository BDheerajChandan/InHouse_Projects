from sentence_transformers import SentenceTransformer
from sentence_transformers.quantization import quantize_embeddings

print(" =========== Started ============= ")
# 1. Load an embedding model
print("Loading a Model")
model = SentenceTransformer("mixedbread-ai/mxbai-embed-large-v1")
print("Model loaded")

# 2a. Encode some text using "binary" quantization
print("Loading the embeddings")
embeddings = model.encode(
    ["I am driving to the lake.", "It is a beautiful day."]
)
print("embeddings : ",embeddings)

print("Loading the binary_embeddings")
binary_embeddings = model.encode(
    ["I am driving to the lake.", "It is a beautiful day."],
    precision="binary",
)
print("binary_embeddings : ",binary_embeddings)

# 2b. or, encode some text without quantization & apply quantization afterwards
print("Loading the embeddings")
embeddings = model.encode(["I am driving to the lake.", "It is a beautiful day."])
print("embeddings : ",embeddings)
binary_embeddings = quantize_embeddings(embeddings, precision="binary")
print("binary_embeddings : ",binary_embeddings)