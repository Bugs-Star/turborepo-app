# tests/test_client.py
import requests
import json

# FastAPI 서버가 실행 중인 주소와 포트
BASE_URL = "http://localhost:8001"

def ask_question(user_id: str, question: str):
    """
    FastAPI 서버의 /query 엔드포인트에 질문을 전송하고 응답을 출력합니다.
    """
    url = f"{BASE_URL}/query"
    
    # 서버에 보낼 데이터 (JSON 형식)
    payload = {
        "user_id": user_id,
        "question": question
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    print(f"🚀 서버에 요청 전송: {url}")
    print(f"👤 사용자 ID: {user_id}")
    print(f"❓ 질문: {question}\n")
    
    try:
        # POST 요청 전송
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        
        # HTTP 상태 코드 확인
        response.raise_for_status()
        
        print("✅ 요청 성공! 서버 응답:")
        # JSON 응답을 예쁘게 출력
        response_data = response.json()
        print(json.dumps(response_data, indent=2, ensure_ascii=False))
        
    except requests.exceptions.HTTPError as http_err:
        print(f"❌ HTTP 오류 발생: {http_err}")
        print(f"응답 내용: {response.text}")
    except requests.exceptions.RequestException as req_err:
        print(f"❌ 요청 중 오류 발생: {req_err}")
    except Exception as e:
        print(f"❌ 알 수 없는 오류 발생: {e}")

if __name__ == "__main__":
    # --- 테스트 예시 ---
    
    # 1. 실제 존재하는 유저 ID로 질문
    print("--- 테스트 1: 정상적인 요청 ---")
    test_user_id_1 = "용훈2" # 실제 MongoDB에 있는 user_id로 변경하세요.
    test_question_1 = "최근에 어떤 상품을 구매했나요?"
    ask_question(test_user_id_1, test_question_1)
    
    print("\n" + "="*50 + "\n")
    
    # 2. 존재하지 않는 유저 ID로 질문
    print("--- 테스트 2: 존재하지 않는 사용자에 대한 요청 ---")
    test_user_id_2 = "non_existent_user"
    test_question_2 = "관심사가 무엇인가요?"
    ask_question(test_user_id_2, test_question_2)

    print("\n" + "="*50 + "\n")

    # 3. 필수 파라미터가 누락된 요청 (서버에서 400 에러를 반환해야 함)
    print("--- 테스트 3: 잘못된 요청 (user_id 누락) ---")
    ask_question("", "이 질문은 어떻게 되나요?")
