import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

// ES 모듈에서 __dirname을 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 현재 디렉토리의 정적 파일(html, js)을 제공
app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`✅ RAG Test Client server running on http://localhost:${PORT}`);
  console.log("   Python API 서버가 실행 중인지 확인하세요 (port 8000)");
});
