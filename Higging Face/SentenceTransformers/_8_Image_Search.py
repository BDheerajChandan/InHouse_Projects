from sentence_transformers import SentenceTransformer
from PIL import Image

print(" =========== Started =========== ")
# Load CLIP model
print("loading a model ")
model = SentenceTransformer("sentence-transformers/clip-ViT-B-32")
print("Model loaded")

# Encode an image:
print("Encoding an Image(Embedding an image)")
img_emb = model.encode(Image.open(r"C:\Users\b.dheeraj\Desktop\Higging Face\docs\Dheeraj PassportPic.jpg"))
print("Image Embeddings : ",img_emb)

# Encode text descriptions
print("Embedding the text")
text_emb = model.encode(
    ["Two dogs in the snow", 
     "A cat on a table", 
     "A picture of boy", 
     "A picture of boy in formal",
     "A picture of boy with blue background"]
)
print("Text Embddings : ",text_emb)

# Compute similarities
similarity_scores = model.similarity(img_emb, text_emb)
print("similarity_scores : ",similarity_scores)