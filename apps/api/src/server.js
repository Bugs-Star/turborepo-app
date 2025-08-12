// src/server.js
import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';

const port = process.env.PORT || 3002;

// DB 연결
connectDB();

// 서버 시작
app.listen(port, () => {
  console.log(`🚀 API server listening at http://localhost:${port}`);
});