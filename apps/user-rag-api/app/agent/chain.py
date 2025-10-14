# app/agent/chain.py
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from app.agent.loader import load_documents_for_user # 새로운 로더를 import

def create_user_rag_chain(user_id: str):
    """특정 사용자의 데이터를 기반으로 RAG 체인을 동적으로 생성합니다."""
    documents = load_documents_for_user(user_id)
    if not documents:
        return None

    # 이 경우에는 문서가 하나뿐이므로 TextSplitter가 큰 의미는 없지만,
    # 만약 사용자 정보가 매우 길어질 경우를 대비해 유지합니다.
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    docs = text_splitter.split_documents(documents)
    if not docs:
        return None

    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vector_store = FAISS.from_documents(docs, embeddings)
    retriever = vector_store.as_retriever()

    prompt_template = """
    당신은 사용자 데이터 분석 전문가입니다. 주어진 사용자 정보를 바탕으로 질문에 대해 친절하고 상세하게 답변해주세요.
    정보에 없는 내용은 추측하지 말고 "데이터에서 관련 정보를 찾을 수 없습니다."라고 답변하세요.

    [사용자 정보]
    {context}

    [질문]
    {question}

    [답변]
    """
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash-latest", temperature=0.1)
    
    rag_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        chain_type_kwargs={"prompt": prompt},
        return_source_documents=True
    )
    return rag_chain
