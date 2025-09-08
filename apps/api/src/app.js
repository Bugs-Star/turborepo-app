/* ------------------------------------------------------------
 * File      : /app.js
 * Brief     : express app 설정 파일
 * Author    : 송용훈
 * Date      : 2025-08-08
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import express from "express";
import cors from "cors";
import qs from "qs";  // 쿼리 파싱 모듈
import routes from "./routes/index.js";


// Express App 생성
const app = express();

// CORS 설정
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://turborepo-app-web.vercel.app',
    'https://turborepo-app-admin.vercel.app',
    'https://bugs-star-web.vercel.app',
    'https://bugs-star-admin.vercel.app'
  ],
  credentials: true,   // 쿠키나 인증 헤더 같은 자격 증명을 포함한 요청을 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware 설정
app.use(express.json());  // JSON 형식으로 된 요청 본문을 파싱해 req.body 객체에 담아줍니다.
app.use(express.urlencoded({ extended: true })); // Form-data 처리

// Route 설정
app.use("/", routes);

// Query parser
app.set("query parser", (str) => qs.parse(str)); // Express의 기본 쿼리 파서 대신 qs 라이브러리를 사용하도록 설정합니다. 이렇게 하면 ?a[b]=c와 같은 복잡한 쿼리 문자열도 객체 형태로 올바르게 파싱 가능


export default app;
