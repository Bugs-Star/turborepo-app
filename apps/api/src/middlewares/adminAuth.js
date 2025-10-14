/* ------------------------------------------------------------
 * File      : /src/middlewares/adminAuth.js
 * Brief     : 아드민 인증 관련 라우트
 * Author    : 송용훈
 * Date      : 2025-08-15
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { isBlacklisted } from '../utils/jwtBlacklistUtil.js';

export const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
    }

    // 블랙리스트 체크
    const isTokenBlacklisted = await isBlacklisted(token);
    if (isTokenBlacklisted) {
      return res.status(401).json({ message: '로그아웃된 토큰입니다.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.adminId);
    
    if (!admin) {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: '토큰이 만료되었습니다. 토큰을 갱신해주세요.',
        code: 'TOKEN_EXPIRED'
      });
    }
    res.status(401).json({ message: '인증에 실패했습니다.' });
  }
};
