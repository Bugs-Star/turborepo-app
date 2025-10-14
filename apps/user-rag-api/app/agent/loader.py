# app/agent/loader.py
from typing import List
from langchain_core.documents import Document
from pymongo import MongoClient
from app import config

def load_documents_for_user(user_id: str) -> List[Document]:
    """MongoDB에서 특정 사용자의 정보를 조회하여 Document 객체로 만듭니다."""
    print(f"MongoDB에서 user_id '{user_id}'의 데이터 로딩 중...")
    
    try:
        client = MongoClient(config.MONGO_URI)
        db = client[config.MONGO_DATABASE]
        
        # 1. 사용자 프로필 조회
        user_profile = db.users.find_one({"email": user_id})
        
        # 2. 사용자의 최근 주문 5개 조회
        recent_orders = list(db.order.find({"email": user_id}).sort("ordered_at", -1).limit(5))
        
        if not user_profile:
            print(f"경고: email '{user_id}'에 해당하는 사용자를 찾을 수 없습니다.")
            return []

        # 3. 조회된 정보를 AI가 이해하기 쉬운 하나의 텍스트로 조합
        order_details = "\n".join([
            f"  - 주문 ID: {order.get('order_id')}, 메뉴: {order.get('menu_name')}, 가격: {order.get('total_price')}원, 주문 시간: {order.get('ordered_at')}"
            for order in recent_orders
        ]) if recent_orders else "  - 최근 주문 내역이 없습니다."

        page_content = (
            f"사용자 '{user_profile.get('name', 'N/A')}' (ID: {user_id})에 대한 정보입니다.\n"
            f"- 이메일: {user_profile.get('email', 'N/A')}\n"
            f"- 가입일: {user_profile.get('signup_date', 'N/A')}\n"
            f"- 최근 주문 내역 (최대 5건):\n{order_details}"
        )
        
        # 메타데이터에는 user_id를 저장
        metadata = {"email": user_id}
        
        # 단 하나의 종합적인 Document를 생성하여 반환
        return [Document(page_content=page_content, metadata=metadata)]

    except Exception as e:
        print(f"오류: MongoDB 연결 또는 데이터 처리 중 실패했습니다 - {e}")
        return []
    finally:
        if 'client' in locals() and client:
            client.close()
