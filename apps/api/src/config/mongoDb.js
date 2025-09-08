/* ------------------------------------------------------------
 * File      : /config/mongoDb.js
 * Brief     : MongoDB 설정 파일
 * Author    : 송용훈
 * Date      : 2025-08-08
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import mongoose from 'mongoose';


// MongoDB 연결 함수
export const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB 연결 성공');
  } catch (err) {
    console.error('❌ MongoDB 연결 실패', err);
    process.exit(1);
  }
};

// MongoDB 연결 종료 함수
export const disconnectMongoDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  } catch (err) {
    console.error('❌ MongoDB 연결 종료 실패', err);
  }
};
