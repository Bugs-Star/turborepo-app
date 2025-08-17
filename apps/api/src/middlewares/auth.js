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

    console.log('토큰 인증 시작:', {
      hasToken: !!token,
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20) + '...'
    });

    // 블랙리스트 체크
    const isTokenBlacklisted = await isBlacklisted(token);
    if (isTokenBlacklisted) {
      console.log('토큰이 블랙리스트에 있음');
      return res.status(401).json({ message: '로그아웃된 토큰입니다.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('토큰 디코딩 성공:', {
      userId: decoded.userId,
      userIdType: typeof decoded.userId,
      exp: decoded.exp,
      iat: decoded.iat
    });

    console.log('사용자 조회 시작:', {
      requestedUserId: decoded.userId,
      userIdType: typeof decoded.userId,
      isObjectId: mongoose.Types.ObjectId.isValid(decoded.userId)
    });

    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      console.error('사용자를 찾을 수 없음:', {
        requestedUserId: decoded.userId,
        userIdType: typeof decoded.userId,
        isObjectId: mongoose.Types.ObjectId.isValid(decoded.userId)
      });
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }

    console.log('사용자 인증 성공:', {
      userId: user._id,
      email: user.email,
      name: user.name
    });

    req.user = user;
    console.log('auth 미들웨어 완료, 다음 단계로 진행');
    console.log('req.user 설정 완료:', {
      _id: req.user._id,
      email: req.user.email,
      name: req.user.name
    });
    console.log('next() 호출 전');
    next();
    console.log('next() 호출 후');
  } catch (error) {
    console.error('토큰 인증 오류:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: '토큰이 만료되었습니다. 토큰을 갱신해주세요.',
        code: 'TOKEN_EXPIRED'
      });
    }
    res.status(401).json({ message: '인증에 실패했습니다.' });
  }
};
