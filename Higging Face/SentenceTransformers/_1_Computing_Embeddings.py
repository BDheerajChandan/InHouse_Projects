from sentence_transformers import SentenceTransformer

print(" ========= Started ========== ")
print("Loading a Model")
model = SentenceTransformer(
    "intfloat/multilingual-e5-large",
    prompts={
        "classification": "Classify the following text: ",
        "retrieval": "Retrieve semantically similar text: ",
        "clustering": "Identify the topic or theme based on the text: ",
    },
    device="cpu",
    default_prompt_name="retrieval",
)
print("Model Loaded")

print("Prompt : ",model.prompts)
print("Devices : ",model.device)
print("default_prompt_name : ",model.default_prompt_name)

# # or
# model.prompts = {
#     "classification": "Classify the following text: ",
#     "retrieval": "Retrieve semantically similar text: ",
#     "clustering": "Identify the topic or theme based on the text: ",
# }
# model.device="cuda"
# model.default_prompt_name="retrieval"

print("Max Sequence Length:", model.max_seq_length) # => Max Sequence Length: 256
model.max_seq_length = 200                          # Change the length to 200
print("Max Sequence Length:", model.max_seq_length) # => Max Sequence Length: 200


# If prompt nor prompt_name are specified in SentenceTransformer.encode, 
# then the prompt specified by default_prompt_name will be applied. 
# If it is None, then no prompt will be applied:

# model = SentenceTransformer(
#     "intfloat/multilingual-e5-large",
#     prompts={
#         "classification": "Classify the following text: ",
#         "retrieval": "Retrieve semantically similar text: ",
#         "clustering": "Identify the topic or theme based on the text: ",
#     },
#     default_prompt_name="retrieval",
# )
# # or
# model.default_prompt_name="retrieval"
# embeddings = model.encode("How to bake a strawberry cake", prompt_name="retrieval")
# embeddings = model.encode("How to bake a strawberry cake")

print("Loading the embeddings")
embeddings = model.encode("How to bake a strawberry cake", prompt="Retrieve semantically similar text: ")
print("embeddings : ",embeddings)