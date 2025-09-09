/* ------------------------------------------------------------
 * File      : /config/redis.js
 * Brief     : Redis 설정 파일
 * Author    : 송용훈
 * Date      : 2025-08-08
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import { createClient } from 'redis';

// Redis 클라이언트 생성
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Redis 연결 이벤트
redisClient.on('connect', () => {
  console.log('✅ Redis 연결 성공');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis 연결 에러:', err);
});

// Redis 연결 함수
export const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('❌ Redis 연결 실패:', error);
  }
};

// Redis 종료 함수
export const disconnectRedis = async () => {
  try {
    await redisClient.quit();
    console.log('🔌 Redis 연결 종료');
  } catch (error) {
    console.error('❌ Redis 연결 종료 실패:', error);
  }
};

export default redisClient;
