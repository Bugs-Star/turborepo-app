# app/rag/chain.py
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from app.rag.loader import load_documents_from_clickhouse # 데이터 로더 함수를 import

def create_rag_chain():
    """RAG 체인을 생성합니다."""
    documents = load_documents_from_clickhouse()
    if not documents:
        return None

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    docs = text_splitter.split_documents(documents)
    if not docs:
        print("경고: 문서를 분할한 후 내용이 없습니다.")
        return None

    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vector_store = FAISS.from_documents(docs, embeddings)
    retriever = vector_store.as_retriever()

    prompt_template = """
    주어진 데이터베이스 정보를 바탕으로 질문에 답변해주세요.

    [데이터베이스 정보]
    {context}

    [질문]
    {question}

    [답변]
    """
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash-latest", temperature=0.3, convert_system_message_to_human=True)
    
    rag_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        chain_type_kwargs={"prompt": prompt},
        return_source_documents=True
    )
    return rag_chain
