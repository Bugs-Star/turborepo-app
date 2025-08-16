import { createClient } from 'redis';

// Redis 클라이언트 생성
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Redis 연결
redisClient.on('error', (err) => {
  console.error('❌ Redis 연결 에러:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis 연결 성공');
});

// Redis 연결 함수
export const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('❌ Redis 연결 실패:', error);
  }
};

// 토큰을 블랙리스트에 추가
export const addToBlacklist = async (token, expiresIn = 7 * 24 * 60 * 60) => {
  try {
    // 토큰을 키로 하고 만료 시간을 설정
    await redisClient.setEx(`blacklist:${token}`, expiresIn, 'true');
    console.log('✅ 토큰이 블랙리스트에 추가되었습니다');
  } catch (error) {
    console.error('❌ 블랙리스트 추가 실패:', error);
    throw error;
  }
};

// 토큰이 블랙리스트에 있는지 확인
export const isBlacklisted = async (token) => {
  try {
    const result = await redisClient.get(`blacklist:${token}`);
    return result === 'true';
  } catch (error) {
    console.error('❌ 블랙리스트 확인 실패:', error);
    return false;
  }
};

// Redis 연결 종료
export const disconnectRedis = async () => {
  try {
    await redisClient.disconnect();
    console.log('🔌 Redis 연결 종료');
  } catch (error) {
    console.error('❌ Redis 연결 종료 실패:', error);
  }
};

export default redisClient;
