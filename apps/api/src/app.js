// src/app.js
import express from "express";
import cors from "cors";
import qs from "qs";
import routes from "./routes/index.js";

const app = express();

// CORS 설정
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://bugs-star-web.vercel.app',
    'https://bugs-star-admin.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Form-data 처리

// query parser
app.set("query parser", (str) => qs.parse(str));

// 라우트
app.use("/", routes);

export default app;
