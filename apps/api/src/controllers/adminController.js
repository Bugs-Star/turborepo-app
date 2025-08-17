import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { addToBlacklist } from '../config/redis.js';
import { generateAccessToken, generateRefreshToken, verifyToken, decodeToken } from '../utils/tokenUtils.js';

// Admin 로그인
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Admin 찾기
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    // 비밀번호 확인
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    // Access Token과 Refresh Token 생성
    const accessToken = generateAccessToken({ adminId: admin._id });
    const refreshToken = generateRefreshToken({ adminId: admin._id });

    // Refresh Token을 DB에 저장
    admin.refreshToken = refreshToken;
    await admin.save();

    res.json({
      accessToken,
      refreshToken,
      _id: admin._id
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// Admin 토큰 갱신
export const adminRefresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh Token이 필요합니다.' });
    }

    // Refresh Token 검증
    const decoded = verifyToken(refreshToken);
    
    // Admin 찾기 및 Refresh Token 확인
    const admin = await Admin.findById(decoded.adminId);
    if (!admin || admin.refreshToken !== refreshToken) {
      return res.status(401).json({ message: '유효하지 않은 Refresh Token입니다.' });
    }

    // 새로운 Access Token 생성
    const newAccessToken = generateAccessToken({ adminId: admin._id });
    
    res.json({
      accessToken: newAccessToken,
      message: '토큰이 성공적으로 갱신되었습니다.'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh Token이 만료되었습니다. 다시 로그인해주세요.' });
    }
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// Admin 로그아웃
export const adminLogout = async (req, res) => {
  try {
    const accessToken = req.header('Authorization')?.replace('Bearer ', '');
    const { refreshToken } = req.body;
    
    console.log('관리자 로그아웃 요청:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      adminId: req.admin?._id
    });

    if (!accessToken) {
      return res.status(400).json({ message: 'Access Token이 필요합니다.' });
    }

    // Access Token을 블랙리스트에 추가
    try {
      await addToBlacklist(accessToken);
      console.log('Access Token 블랙리스트 추가 완료');
    } catch (blacklistError) {
      console.error('블랙리스트 추가 실패:', blacklistError);
      // 블랙리스트 실패해도 로그아웃은 계속 진행
    }

    // Refresh Token 무효화 (DB에서 제거)
    if (refreshToken) {
      try {
        const decoded = decodeToken(refreshToken);
        if (decoded && decoded.adminId) {
          await Admin.findByIdAndUpdate(decoded.adminId, { refreshToken: null });
          console.log('Refresh Token DB에서 제거 완료');
        }
      } catch (refreshError) {
        console.error('Refresh Token 제거 실패:', refreshError);
        // Refresh Token 제거 실패해도 로그아웃은 계속 진행
      }
    }

    console.log('관리자 로그아웃 완료');
    res.json({
      message: '관리자 로그아웃이 완료되었습니다.'
    });
  } catch (error) {
    console.error('관리자 로그아웃 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// Admin 프로필 조회
export const getAdminProfile = async (req, res) => {
  res.json({
    admin: req.admin
  });
};
