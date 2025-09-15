/* ------------------------------------------------------------
 * File      : /src/utils/refreshTokenUtils.js
 * Brief     : Refresh Token 관련 함수
 * Author    : 이정관
 * Date      : 2025-08-15
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateAccessToken } from './accessTokenUtils.js';

// Refresh Token 생성 (7일)
export const generateRefreshToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET이 설정되지 않았습니다.');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Refresh Token 검증
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

// Refresh Token에서 페이로드 추출 (검증 없이)
export const decodeRefreshToken = (token) => {
  return jwt.decode(token);
};

// Refresh Token을 사용하여 새로운 Access Token 생성
export const refreshAccessToken = async (refreshToken) => {
  // Refresh Token 검증
  if (!refreshToken) {
    throw new Error('Refresh Token이 필요합니다.');
  }
  const decoded = verifyRefreshToken(refreshToken);
  
  // 유저 찾기 및 Refresh Token 확인
  const user = await User.findById(decoded.userId);
  if (!user || user.refreshToken !== refreshToken) {
    throw new Error('유효하지 않은 Refresh Token입니다.');
  }

  // 새로운 Access Token 생성
  const newAccessToken = generateAccessToken({ userId: user._id });
  
  return {
    accessToken: newAccessToken,
    message: '토큰이 성공적으로 갱신되었습니다.'
  };
};
