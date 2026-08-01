from sentence_transformers import SentenceTransformer

print(" ========== Started =========== ")
# 1. Load a model that supports both text and images
print("Loading a Modal")
model = SentenceTransformer("Qwen/Qwen3-VL-Embedding-2B")
print("Modal Loaded")

# 2. Encode images from URLs
print("Image Embeddings started")
img_embeddings = model.encode([
    "https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/transformers/tasks/car.jpg",
    "https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/bee.jpg",
    r"C:\\Users\\b.dheeraj\\Desktop\\Higging Face\\docs\\Dheeraj PassportPic.jpg"
])
print("image Embeddings : ",img_embeddings)

# 3. Encode text queries (one matching + one hard negative per image)
print("Text embeddings started ")
text_embeddings = model.encode([
    "A green car parked in front of a yellow building",
    "A red car driving on a highway",
    "A bee on a pink flower",
    "A wasp on a wooden table",
    "Person in formal",
    "Boy standing infront of blue background"
])

print("Text embeddings : ",text_embeddings)

# 4. Compute cross-modal similarities
similarities = model.similarity(text_embeddings, img_embeddings)
print("similarities : ",similarities)