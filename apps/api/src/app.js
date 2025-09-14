/* ------------------------------------------------------------
 * File      : /src/app.js
 * Brief     : express app 설정 파일
 * Author    : 송용훈
 * Date      : 2025-08-08
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import express from "express";
import cors from "cors";
import helmet from "helmet";
import qs from "qs";  // 쿼리 파싱 모듈
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";

// Express App 생성
const app = express();

// 보안 설정
// -- CORS 설정
app.use(cors({
  origin: [
    'http://localhost:3000',                     // dev local web 주소
    'http://localhost:3001',                     // dev local admin 주소
    'https://turborepo-app-web.vercel.app',      // dev deploy web 주소
    'https://bugs-star-admin-alpha.vercel.app',  // dev deploy admin 주소
    'https://bugs-star-web.vercel.app',          // main deploy web 주소
    'https://bugs-star-admin.vercel.app'         // main deploy admin 주소
  ],
  credentials: true,   // 쿠키나 인증 헤더 같은 자격 증명을 포함한 요청을 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// -- Helmet 설정
app.use(helmet()); 
app.use(cookieParser()); 

// Middleware 설정
// -- Body Parser
app.use(express.json());  // JSON 형식으로 된 요청 본문을 파싱해 req.body 객체에 담아줍니다.
app.use(express.urlencoded({ extended: true })); // Form-data 처리

// Route 설정
app.use("/", routes);

// Error 핸들링
// -- 404 Not Found 핸들러
app.use((req, res, next) => {
  const error = new Error('Not Found: The requested resource could not be found.');
  error.status = 404;
  next(error);
});

// -- 중앙 에러 핸들러
app.use((error, req, res, next) => {
  // 에러 로깅
  console.error(error);

  const status = error.status || 500;
  const message = error.message || 'Something went wrong on the server.';

  res.status(status).json({
    success: false,
    message: message,
  });
});

// Query parser
app.set("query parser", (str) => qs.parse(str)); // Express의 기본 쿼리 파서 대신 qs 라이브러리를 사용하도록 설정합니다. 이렇게 하면 ?a[b]=c와 같은 복잡한 쿼리 문자열도 객체 형태로 올바르게 파싱 가능

export default app;
