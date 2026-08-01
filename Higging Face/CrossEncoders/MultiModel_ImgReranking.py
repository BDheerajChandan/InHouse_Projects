from sentence_transformers import CrossEncoder
print(" =========== Started =========== ")
print("Loading a Modal")
model = CrossEncoder("Qwen/Qwen3-VL-Reranker-2B")
print("Model Loaded")

query = "A green car parked in front of a yellow building"
print("query : ",query)

documents = [
    # Image documents (URL or local file path)
    "https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/transformers/tasks/car.jpg",
    "https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/bee.jpg",
    
    # Text document
    "A vintage Volkswagen Beetle painted in bright green sits in a driveway.",
    
    # Combined text + image document
    {
        "text": "A car in a European city",
        "image": "https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/transformers/tasks/car.jpg",
    },
]
print("documents (Img+Text+keyValue pairs) : ",documents)

print("Finding the ranks")
rankings = model.rank(query, documents)
print("rankings : ",rankings)

for rank in rankings:
    print(f"{rank['score']:.4f}\t(document {rank['corpus_id']})")