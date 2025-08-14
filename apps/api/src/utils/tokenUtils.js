import jwt from 'jsonwebtoken';

// Access Token 생성 (15분)
export const generateAccessToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET이 설정되지 않았습니다.');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// Refresh Token 생성 (7일)
export const generateRefreshToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET이 설정되지 않았습니다.');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// 토큰 검증
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

// 토큰에서 만료 시간 확인
export const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// 토큰에서 페이로드 추출 (검증 없이)
export const decodeToken = (token) => {
  return jwt.decode(token);
};
