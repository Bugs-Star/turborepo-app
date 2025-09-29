import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; // 파일 존재 여부 확인을 위한 모듈

// --- .env 파일 로딩 로직 (모노레포용) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');

// --- 디버깅 로그 추가 ---
console.log(`[Debug] mongoClient.js: 현재 디렉토리: ${__dirname}`);
console.log(`[Debug] mongoClient.js: 계산된 .env 경로: ${envPath}`);
if (fs.existsSync(envPath)) {
    console.log(`[Debug] mongoClient.js: ✅ .env 파일이 해당 경로에 존재합니다.`);
} else {
    console.error(`[Debug] mongoClient.js: ❌ ERROR! .env 파일이 해당 경로에 없습니다!`);
}
// --- 디버깅 로그 끝 ---

dotenv.config({ path: envPath });

// Mongoose 이벤트 리스너
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB (Mongoose) 연결 성공');
});
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB (Mongoose) 연결 에러 발생', err);
});
mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB (Mongoose) 연결이 끊어졌습니다.');
});

// MongoDB 연결 함수
export const connectMongoDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  
  try {
    // --- 디버깅 로그 추가 ---
    console.log(`[Debug] connectMongoDB: 읽어온 MONGO_URI: ${process.env.MONGO_URI}`);
    // --- 디버깅 로그 끝 ---

    if (!process.env.MONGO_URI) {
      throw new Error("환경 변수 MONGO_URI이 설정되지 않았습니다. .env 파일을 확인해주세요.");
    }
    await mongoose.connect(process.env.MONGO_URI);
  } catch (err) {
    console.error('❌ MongoDB 최초 연결에 실패했습니다.', err);
    process.exit(1);
  }
};

// MongoDB 종료 함수
export const disconnectMongoDB = async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
};

