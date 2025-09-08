// src/server.js
import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

import connectDB from './config/mongoDb.js';   
import { connectRedis } from './config/redis.js';
import { connectClickHouse } from './config/clickhouse.js';

const port = process.env.PORT || 3002;

// DB 연결
connectDB();

// Redis 연결
connectRedis();

// ClickHouse 연결
connectClickHouse();

// 서버 시작
app.listen(port, () => {
  console.log(`🚀 API server listening at http://localhost:${port}`);
});
