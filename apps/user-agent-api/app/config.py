# app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

# Gemini API 설정
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY가 .env 파일에 없습니다.")
os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY

# ⭐️ MongoDB 연결 설정
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI가 .env 파일에 없습니다.")
MONGO_DATABASE = os.getenv("MONGO_DATABASE", "test")
