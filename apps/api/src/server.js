/* ------------------------------------------------------------
 * File      : /server.js
 * Brief     : API server 설정 파일
 * Author    : 송용훈
 * Date      : 2025-08-08
 * Version   :
 * History
 * ------------------------------------------------------------*/

import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();
import { connectMongoDB, disconnectMongoDB } from "./config/mongoDb.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";
import {
  connectClickHouse,
  disconnectClickHouse,
} from "./config/clickhouse.js";

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
process.on("SIGINT", async () => {
  console.log("🛑 Received SIGINT signal. Shutting down gracefully...");

  // DB 종료 함수 호출
  await disconnectMongoDB();
  await disconnectRedis();
  await disconnectClickHouse();

  process.exit(0); // 프로세스 정상 종료
});

// 즉시적인 에러
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1); // 프로세스 에러 종료
});
