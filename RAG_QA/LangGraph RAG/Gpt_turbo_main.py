# Gpt_3_turbo_main.py
from pathlib import Path
from langchain_community.document_loaders import (
    TextLoader,
    PyPDFLoader,
    Docx2txtLoader,
    UnstructuredHTMLLoader
)
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.documents import Document
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, List
import os
from dotenv import load_dotenv

load_dotenv()

Docs_Dir = Path("docs")

# ======================
# 1. LOAD DOCUMENTS
# ======================
def load_docs():
    """Load documents with multiple format support"""
    docs = []
    supported_formats = {
        '.txt': TextLoader,
        '.md': TextLoader,
        '.pdf': PyPDFLoader,
        '.docx': Docx2txtLoader,
        '.html': UnstructuredHTMLLoader
    }
    
    for fp in Docs_Dir.glob('*'):
        if not fp.is_file():
            continue
            
        suffix = fp.suffix.lower()
        
        if suffix in ['.txt', '.md']:
            try:
                docs.extend(TextLoader(str(fp), encoding='utf-8').load())
                print(f"✓ Loaded: {fp.name}")
            except Exception as e:
                print(f"⚠️ Error loading {fp.name}: {e}")
                
        elif suffix == '.pdf':
            try:
                docs.extend(PyPDFLoader(str(fp)).load())
                print(f"✓ Loaded: {fp.name}")
            except Exception as e:
                print(f"⚠️ Error loading {fp.name}: {e}")
                
        elif suffix == '.docx':
            try:
                docs.extend(Docx2txtLoader(str(fp)).load())
                print(f"✓ Loaded: {fp.name}")
            except Exception as e:
                print(f"⚠️ Error loading {fp.name}: {e}")
                
        elif suffix == '.html':
            try:
                docs.extend(UnstructuredHTMLLoader(str(fp)).load())
                print(f"✓ Loaded: {fp.name}")
            except Exception as e:
                print(f"⚠️ Error loading {fp.name}: {e}")
        else:
            print(f"⚠️ Skipping unsupported file: {fp.name}")
    
    print(f"\n📄 Total documents loaded: {len(docs)}")
    return docs

# ======================
# 2. SPLIT INTO CHUNKS
# ======================
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,      # Smaller chunks for better precision
    chunk_overlap=100    # More overlap to maintain context
)
chunks = splitter.split_documents(load_docs())
print(f"📦 Total chunks created: {len(chunks)}\n")

# ======================
# 3. CREATE EMBEDDINGS
# ======================
key = os.getenv("OPENAI_API_KEY")
embeddings = OpenAIEmbeddings(api_key=key)

# Check if index already exists
if not Path('Chroma_db').exists():
    Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory='Chroma_db',
        collection_name='rag_docs',
    )
    print('✓ Index built\n')
else:
    print('✓ Using existing index\n')

# ======================
# 4. STATE DEFINITION
# ======================
class RagState(TypedDict):
    question: str
    docs: List[Document]
    answer: str

# ======================
# 5. RETRIEVE NODE
# ======================
vectorStore = Chroma(
    persist_directory='Chroma_db',
    collection_name='rag_docs',
    embedding_function=embeddings
)
retriever = vectorStore.as_retriever(
    search_type="similarity",
    search_kwargs={'k': 5}  # Retrieve more chunks for better coverage
)

def retrieve(state: RagState) -> RagState:
    q = state['question']
    docs = retriever.invoke(q)
    
    # # Debug: Print retrieved chunks
    # print(f"\n🔍 Retrieved {len(docs)} chunks:")
    # for i, doc in enumerate(docs, 1):
    #     preview = doc.page_content[:100].replace('\n', ' ')
    #     print(f"  {i}. {preview}...")
    # print()
    
    return {
        'question': q,
        'docs': docs,
        'answer': ''
    }

# ======================
# 6. GENERATE NODE
# ======================
llm = ChatOpenAI(model='gpt-3.5-turbo', temperature=0.3)

def generate(state: RagState) -> RagState:
    q = state['question'].strip().lower()
    docs = state['docs']
    
    context = '\n\n'.join([d.page_content for d in docs])
    
    messages = [   
        SystemMessage(content=(
            f"Answer the question based on the context below:\n{context}\nQuestion: {q}\nAnswer: "
        )),
        HumanMessage(content=f"Question: {q}\n\nContext:\n{context}")
    ]
    resp = llm.invoke(messages)
    return {**state, 'answer': resp.content}

# ======================
# 7. BUILD GRAPH
# ======================
def build_graph():
    g = StateGraph(RagState)
    g.add_node("retrieve", retrieve)
    g.add_node('generate', generate)
    g.add_edge(START, 'retrieve')
    g.add_edge('retrieve', 'generate')
    g.add_edge('generate', END)
    return g.compile()

rag_app = build_graph()

# ======================
# 8. RUN APPLICATION
# ======================
print("=" * 60)
print("RAG Application Ready! Ask questions (press Enter to quit)")
print("=" * 60)

while True:
    q = input('\n❓ Ask: ').strip()
    if not q:
        print("👋 Goodbye!")
        break
    
    result = rag_app.invoke({
        'question': q,
        'docs': [],
        'answer': ''
    })
    
    print(f'\n💡 Answer: {result["answer"]}')
    print(f'📊 Chunks used: {len(result["docs"])}')