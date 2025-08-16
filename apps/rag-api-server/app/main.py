# app/main.py
import sys
import os

# ⭐️ [핵심 수정] 프로젝트 루트 디렉토리를 Python 경로에 직접 추가합니다.
# 이 코드는 다른 import 구문들보다 항상 맨 위에 있어야 합니다.
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

# --- 이제 기존 import 시작 ---
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from app.rag.chain import create_rag_chain # RAG 체인 생성 함수를 import

# ⭐️ [CORS] CORS 미들웨어를 import 합니다.
from fastapi.middleware.cors import CORSMiddleware


# --- FastAPI 앱 설정 ---
app = FastAPI(
    title="RAG Agent API",
    description="ClickHouse 데이터를 기반으로 질문에 답변하는 AI 에이전트 서버",
    version="1.0.0"
)

# ⭐️ [CORS] 허용할 출처(origin)를 정의합니다.
# 여기서는 테스트 클라이언트가 실행되는 주소를 추가합니다.
origins = [
    "http://localhost:3000",
]

# ⭐️ [CORS] 앱에 CORS 미들웨어를 추가합니다.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # 모든 메소드 허용 (GET, POST, OPTIONS 등)
    allow_headers=["*"], # 모든 헤더 허용
)


# RAG 체인을 전역 변수로 로드 (서버 시작 시 한 번만 실행)
print("RAG 체인을 초기화합니다...")
rag_chain = create_rag_chain()
if rag_chain is None:
    print("🚨 오류: RAG 체인 초기화에 실패했습니다. 서버를 시작할 수 없습니다.")
else:
    print("✅ RAG 체인이 성공적으로 준비되었습니다.")

# 요청 본문(request body)의 데이터 타입을 정의
class QueryRequest(BaseModel):
    question: str

# API 엔드포인트(Endpoint) 생성
@app.post("/query", summary="RAG 에이전트에게 질문하기")
async def process_query(request: QueryRequest):
    if not rag_chain:
        raise HTTPException(status_code=503, detail="RAG chain is not initialized. Please check server logs.")
    if not request.question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    try:
        print(f"질문 수신: {request.question}")
        result = rag_chain.invoke(request.question)
        
        return {
            "answer": result.get("result", "답변을 생성하지 못했습니다."),
            "source_documents": result.get("source_documents", [])
        }
    except Exception as e:
        print(f"쿼리 처리 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing the query: {e}")

# 서버 실행 (개발용)
if __name__ == "__main__":
    # ⭐️ uvicorn 실행 시 app 경로를 문자열로 지정
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
