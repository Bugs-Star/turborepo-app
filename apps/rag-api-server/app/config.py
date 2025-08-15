# app/config.py
import os
from dotenv import load_dotenv

# .env 파일의 환경 변수를 로드합니다.
load_dotenv()

# Gemini API 설정
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY가 .env 파일에 없습니다.")
os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY

# ClickHouse 데이터베이스 설정
CLICKHOUSE_HOST = os.getenv("CLICKHOUSE_HOST", "localhost")
CLICKHOUSE_USERNAME = os.getenv("CLICKHOUSE_USERNAME", "default")
CLICKHOUSE_PASSWORD = os.getenv("CLICKHOUSE_PASSWORD", "1234")
CLICKHOUSE_DATABASE = os.getenv("CLICKHOUSE_DATABASE", "default")
CLICKHOUSE_TABLE = os.getenv("CLICKHOUSE_TABLE", "rag_unified_store_summary")

# 포트 번호 처리 로직
port_str = os.getenv("CLICKHOUSE_PORT")
CLICKHOUSE_PORT = int(port_str) if port_str else 8123