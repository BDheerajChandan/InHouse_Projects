import torch
from sentence_transformers import SentenceTransformer
from sentence_transformers.util import dot_score, normalize_embeddings, semantic_search

print(" ========= Started ========= ")
print("Loading a model")
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
print("Model loaded")

# Corpus with example documents
corpus = [
    "Machine learning is a field of study that gives computers the ability to learn without being explicitly programmed.",
    "Deep learning is part of a broader family of machine learning methods based on artificial neural networks with representation learning.",
    "Neural networks are computing systems vaguely inspired by the biological neural networks that constitute animal brains.",
    "Mars rovers are robotic vehicles designed to travel on the surface of Mars to collect data and perform experiments.",
    "The James Webb Space Telescope is the largest optical telescope in space, designed to conduct infrared astronomy.",
    "SpaceX's Starship is designed to be a fully reusable transportation system capable of carrying humans to Mars and beyond.",
    "Global warming is the long-term heating of Earth's climate system observed since the pre-industrial period due to human activities.",
    "Renewable energy sources include solar, wind, hydro, and geothermal power that naturally replenish over time.",
    "Carbon capture technologies aim to collect CO2 emissions before they enter the atmosphere and store them underground.",
]
print("corpus : ",corpus)

# Use "convert_to_tensor=True" to keep the tensors on GPU (if available)
print("Corpus embeddings started")
corpus_embeddings = model.encode_document(corpus, convert_to_tensor=True)

# # Speed Optimization (cuda)
# print("Loading cuda")
# corpus_embeddings = corpus_embeddings.to("cuda")
# print("corpus_embeddings (cuda) : ",corpus_embeddings)

# Speed Optimization (cpu)
print("Loading CPU")
corpus_embeddings = corpus_embeddings.to("cpu")
print("corpus_embeddings (cpu) : ",corpus_embeddings)

corpus_embeddings = normalize_embeddings(corpus_embeddings)
print("corpus_embeddings normalize_embeddings : ",corpus_embeddings)

# Query sentences:
queries = [
    "How do artificial neural networks work?",
    "What technology is used for modern space exploration?",
    "How can we address climate change challenges?",
]
print("queries : ",queries)

# Find the closest 5 sentences of the corpus for each query sentence based on cosine similarity
top_k = min(5, len(corpus))
for query in queries:
    # query_embedding = model.encode_query(query, convert_to_tensor=True)
    query_embedding = model.encode_query([query], convert_to_tensor=True)

    # Speed Optimization
    print("query embeddings started")
    
    # # query_embeddings by cuda
    # query_embeddings = query_embedding.to("cuda")
    
    # query_embeddings by cpu
    query_embeddings = query_embedding.to("cpu")
    
    print("query_embeddings : ",query_embeddings)
    query_embeddings = normalize_embeddings(query_embeddings)
    # query_embeddings = normalize_embeddings(query_embeddings.unsqueeze(0))
    print("normalize_embeddings query_embeddings : ",query_embeddings)
    hits = semantic_search(query_embeddings, corpus_embeddings, score_function=dot_score)
    print("hits : ",hits)

    # We use cosine-similarity and torch.topk to find the highest 5 scores
    similarity_scores = model.similarity(query_embedding, corpus_embeddings)[0]
    print("similarity_scores : ",similarity_scores)
    scores, indices = torch.topk(similarity_scores, k=top_k)

    print("\nQuery:", query)
    print("Top 5 most similar sentences in corpus:")

    for score, idx in zip(scores, indices):
        print(f"(Score: {score:.4f})", corpus[idx])