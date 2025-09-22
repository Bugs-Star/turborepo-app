/* ------------------------------------------------------------
 * File      : /src/middlewares/auth.js
 * Brief     : 인증 관련 라우트
 * Author    : 송용훈
 * Date      : 2025-08-14
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isBlacklisted } from '../utils/jwtBlacklistUtil.js';

// express.Router()
export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
    }

    // 블랙리스트 체크
    // -- 로그아웃 된 토큰인지 확인
    const isTokenBlacklisted = await isBlacklisted(token);
    if (isTokenBlacklisted) {
      return res.status(401).json({ message: '로그아웃된 토큰입니다.' });
    }

    // -- 유효성 검사
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }

    // -- 이상이 없으므로 next() 실행
    req.user = user;
    next();
  } catch (error) {
    // 토큰 인증 오류
    console.error('토큰 인증 오류:', error);

    // -- 토큰 만료
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: '토큰이 만료되었습니다. 토큰을 갱신해주세요.',
        code: 'TOKEN_EXPIRED'
      });
    }

    // -- 기타 오류
    res.status(401).json({ message: '인증에 실패했습니다.' });
  }
};
