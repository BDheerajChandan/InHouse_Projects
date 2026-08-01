# Text_reranking_numpy.py

import numpy as np
from sentence_transformers import CrossEncoder

print(" ========== Started ========== ")
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

sentence_combinations = [[query, sentence] for sentence in corpus]
print("sentence_combinations : ",sentence_combinations)
scores = model.predict(sentence_combinations)
print("scores : ",scores)

# Sort the scores in decreasing order to get the corpus indices
ranked_indices = np.argsort(scores)[::-1]
print("Scores:", scores)
print("Indices:", ranked_indices)