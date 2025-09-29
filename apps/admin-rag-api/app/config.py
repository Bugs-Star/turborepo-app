# app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

# -----------------------------
# Gemini API 설정
# -----------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY가 .env 파일에 없습니다.")
os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY

# -----------------------------
# MongoDB 연결 설정
# -----------------------------
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI가 .env 파일에 없습니다.")
MONGO_DATABASE = os.getenv("MONGO_DATABASE", "test")

# -----------------------------
# ClickHouse 연결 설정
# -----------------------------
CLICKHOUSE_HOST = os.getenv("CLICKHOUSE_HOST")
CLICKHOUSE_PORT = int(os.getenv("CLICKHOUSE_PORT", "8443"))  # 포트 기본값 8443
CLICKHOUSE_USERNAME = os.getenv("CLICKHOUSE_USERNAME")
CLICKHOUSE_PASSWORD = os.getenv("CLICKHOUSE_PASSWORD")
CLICKHOUSE_DATABASE = os.getenv("CLICKHOUSE_DATABASE")
CLICKHOUSE_TABLE = os.getenv("CLICKHOUSE_TABLE")

# 필수값 체크
for var_name in ["CLICKHOUSE_HOST", "CLICKHOUSE_USERNAME", "CLICKHOUSE_PASSWORD", "CLICKHOUSE_DATABASE", "CLICKHOUSE_TABLE"]:
    if not globals()[var_name]:
        raise ValueError(f"{var_name}가 .env 파일에 없습니다.")
