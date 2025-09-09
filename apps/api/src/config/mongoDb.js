/* ------------------------------------------------------------
 * File      : /config/mongoDb.js
 * Brief     : MongoDB 설정 파일
 * Author    : 송용훈
 * Date      : 2025-08-08
 * Version   : 
 * History
 *   - 2025-09-08 : 몽구스 이벤트 리스너 추가(송용훈)
 * ------------------------------------------------------------*/

import mongoose from 'mongoose';

// Mongoose 이벤트 리스너
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB 연결 성공');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB 연결 에러 발생', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB 연결이 끊어졌습니다. 재연결을 시도합니다...');
});

// MongoDB 연결 함수
export const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (err) {
    console.error('❌ MongoDB 최초 연결에 실패했습니다.', err);  // 최초연결 실패일 경우 추가 예외처리
    process.exit(1);
  }
};

// MongoDB 종료 함수
export const disconnectMongoDB = async () => {
  await mongoose.disconnect();
  console.log('🔌 MongoDB 연결을 정상적으로 종료했습니다.');
};
