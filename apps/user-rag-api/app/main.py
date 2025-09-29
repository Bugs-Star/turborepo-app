# app/main.py
import sys
import os

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from app.agent.chain import create_user_rag_chain

app = FastAPI(
    title="User-Centric RAG Agent API",
    description="MongoDB의 특정 사용자 데이터를 기반으로 질문에 답변하는 AI 에이전트",
    version="1.0.0"
)

class QueryRequest(BaseModel):
    user_id: str
    question: str

@app.post("/query", summary="특정 사용자에게 대해 질문하기")
async def process_query(request: QueryRequest):
    if not request.user_id or not request.question:
        raise HTTPException(status_code=400, detail="user_id and question are required")

    try:
        print(f"'{request.user_id}'에 대한 질문 수신: {request.question}")
        
        # ⭐️ 요청이 들어올 때마다 해당 유저의 RAG 체인을 동적으로 생성
        rag_chain = create_user_rag_chain(request.user_id)
        
        if not rag_chain:
            raise HTTPException(status_code=404, detail=f"User with id '{request.user_id}' not found or has no data.")

        result = rag_chain.invoke(request.question)
        
        return {
            "answer": result.get("result", "답변을 생성하지 못했습니다."),
            "source_documents": result.get("source_documents", [])
        }
    except Exception as e:
        print(f"쿼리 처리 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing the query: {e}")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True) # 포트 번호를 8001로 변경
