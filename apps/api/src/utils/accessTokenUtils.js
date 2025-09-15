/* ------------------------------------------------------------
 * File      : /src/utils/accessTokenUtils.js
 * Brief     : Access Token 관련 함수
 * Author    : 송용훈
 * Date      : 2025-09-14
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import jwt from 'jsonwebtoken';

// Access Token 생성 (15분)
export const generateAccessToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET이 설정되지 않았습니다.');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// Access Token 토큰 검증
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

// Access Token 토큰 만료 시간 확인
export const isAccessTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Access Token 토큰에서 페이로드 추출 (검증 없이)
export const decodeAccessToken = (token) => {
  return jwt.decode(token);
};
