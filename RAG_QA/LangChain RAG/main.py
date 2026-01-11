from dotenv import load_dotenv
load_dotenv()
import os
def langchain_rag():
    # ------------------ Load PDF ------------------
    from langchain_community.document_loaders import PyPDFLoader

    loader = PyPDFLoader(r"C:\Users\KIIT\Downloads\DHEERAJ RESUME 10 03 2025.pdf")
    documents = loader.load()
    print("PDF loaded successfull!!")

    # ------------------ Split Text ------------------
    from langchain_text_splitters import RecursiveCharacterTextSplitter

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = splitter.split_documents(documents)

    # ------------------ Embeddings ------------------
    from langchain_openai import OpenAIEmbeddings
    embeddings = OpenAIEmbeddings(api_key=os.getenv("OPENAI_API_KEY"))

    # ------------------ Vector Store ------------------
    from langchain_community.vectorstores import FAISS
    vectorstore = FAISS.from_documents(chunks, embeddings)

    # ------------------ Retriever ------------------
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

    # ------------------ LLM ------------------
    from langchain_openai import ChatOpenAI
    llm = ChatOpenAI(model="gpt-3.5-turbo",api_key=os.getenv("OPENAI_API_KEY"))

    # ------------------ RAG Chain ------------------
    from langchain.chains.combine_documents import create_stuff_documents_chain
    from langchain.chains.retrieval import create_retrieval_chain
    from langchain.prompts import PromptTemplate

    custom_prompt = PromptTemplate(
        input_variables=["input", "context"],
        template="Answer the question based on the context below:\n{context}\nQuestion: {input}\nAnswer:"
    )
    qa_chain = create_stuff_documents_chain(llm,prompt=custom_prompt)
    rag_chain = create_retrieval_chain(retriever, qa_chain)

    # ------------------ Query ------------------
    print("Ask a query : ")
    q=input()
    response = rag_chain.invoke({"input": q})
    print(response["answer"])

langchain_rag()