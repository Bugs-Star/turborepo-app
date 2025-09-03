import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { isBlacklisted } from '../config/redis.js';

export const auth = async (req, res, next) => {
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

    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('토큰 인증 오류:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: '토큰이 만료되었습니다. 토큰을 갱신해주세요.',
        code: 'TOKEN_EXPIRED'
      });
    }
    res.status(401).json({ message: '인증에 실패했습니다.' });
  }
};
