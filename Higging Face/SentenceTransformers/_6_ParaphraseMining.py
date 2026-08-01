from sentence_transformers import SentenceTransformer
from sentence_transformers.util import paraphrase_mining

print(" ========= Started ========= ")
print("Loading a Model")
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
print("Model Loaded")

# Single list of sentences - Possible tens of thousands of sentences
sentences = [
    "The cat sits outside",
    "A man is playing guitar",
    "I love pasta",
    "The new movie is awesome",
    "The cat plays in the garden",
    "A woman watches TV",
    "The new movie is so great",
    "Do you like pizza?",
]
print("sentences : ",sentences)

# paraphrases = paraphrase_mining(model, sentences)
paraphrases = paraphrase_mining(model, sentences, corpus_chunk_size=len(sentences), top_k=1)

print("paraphrases : ",paraphrases)
print("======================================")
for paraphrase in paraphrases[0:10]:
    score, i, j = paraphrase
    print("{} \t\t {} \t\t Score: {:.4f}".format(sentences[i], sentences[j], score))