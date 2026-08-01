# Text_reranking.py

from sentence_transformers import CrossEncoder

print(" =========== Sarted ============ ")
# 1. Load a pretrained CrossEncoder model
print("Loading the Model")
model = CrossEncoder("cross-encoder/stsb-distilroberta-base")
print("Model loaded")

# We want to compute the similarity between the query sentence...
query = "A man is eating pasta."
print("query : ",query)

# ... and all sentences in the corpus
corpus = [
    "A man is eating food.",
    "A man is eating a piece of bread.",
    "The girl is carrying a baby.",
    "A man is riding a horse.",
    "A woman is playing violin.",
    "Two men pushed carts through the woods.",
    "A man is riding a white horse on an enclosed ground.",
    "A monkey is playing drums.",
    "A cheetah is running behind its prey.",
]
print("List of sentences : ",corpus)

# 2. We rank all sentences in the corpus for the query
ranks = model.rank(query, corpus)
print("ranks for list of sentences and query : ",ranks)

# Print the scores
print("Query: ", query)
for rank in ranks:
    print(f"{rank['score']:.2f}\t{corpus[rank['corpus_id']]}")