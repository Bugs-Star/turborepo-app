/* ------------------------------------------------------------
 * File      : /server.js
 * Brief     : API server 설정 파일
 * Author    : 송용훈
 * Date      : 2025-08-08
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import app from './app.js';
import dotenv from 'dotenv';
dotenv.config();

import { connectMongoDB, disconnectMongoDB } from './config/mongoDb.js';   
import { connectRedis, disconnectRedis } from './config/redis.js';
import { connectClickHouse, disconnectClickHouse } from './config/clickhouse.js';


// 서버 포트
const port = process.env.PORT || 3002;

// MongoDB, Redis, ClickHouse 연결
connectMongoDB();
connectRedis();
connectClickHouse();

// 서버 시작
app.listen(port, () => {
  console.log(`🚀 API server listening at http://localhost:${port}`);
});

// 서버 종료
process.on('SIGINT', async () => {
  console.log('Received SIGINT signal. Shutting down gracefully...');
  
  // 종료 함수 호출
  await disconnectMongoDB();
  await disconnectRedis();
  await disconnectClickHouse();
  
  // 프로세스 종료
  process.exit(0);
});
