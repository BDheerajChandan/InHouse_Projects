from sentence_transformers import SentenceTransformer

print(" ========== Started ========== ")
# The sentences to encode
sentences = [
    "The weather is lovely today.",
    "It's so sunny outside!",
    "He drove to the stadium.",
]
print("sentences : ",sentences)

def main():
    print("Loading a Model")
    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    print("Model Loaded")
    
    print("Loading the embeddings")
    embeddings = model.encode(sentences,
        device=["cpu"] # or or ["cuda:0", "cuda:1"] or["cpu", "cpu", "cpu", "cpu"]
    )                                   # Encode with multiple GPUs
    print("embeddings : ",embeddings)
    
# def main():
#     model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
#     pool = model.start_multi_process_pool(target_devices=["cpu","cpu"])  # Start a multi-process pool with multiple GPUs
#     embeddings = model.encode(sentences, pool=pool)                                # Encode with multiple GPUs
#     model.stop_multi_process_pool(pool)                                         # Don't forget to stop the pool after usage


if __name__ == "__main__":
    main()