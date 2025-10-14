/* ------------------------------------------------------------
 * File      : /utils/jwtBlacklistUtil.js
 * Brief     : JWT 토큰 블랙리스트 관리 유틸리티
 * Author    : 송용훈
 * Date      : 2025-09-09
 * Version   : 
 * History
 *   - 2025-09-09: /config/redis.js 에 있던 함수를 따로 분리
 *   - 2025-09-22: jwtBlacklist.js → jwtBlacklistUtil.js로 이름 변경
 * ------------------------------------------------------------*/

import redisClient  from '../config/redis.js';

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
    throw error;
  }
};
