import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { addToBlacklist } from '../config/redis.js';

// JWT 토큰 생성
const generateToken = (adminId) => {
  return jwt.sign({ adminId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

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

    // 토큰 생성
    const token = generateToken(admin._id);

    res.json({
      token,
      _id: admin._id
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// Admin 로그아웃
export const adminLogout = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(400).json({ message: '토큰이 필요합니다.' });
    }

    // 토큰을 블랙리스트에 추가
    await addToBlacklist(token);

    res.json({
      message: '관리자 로그아웃이 완료되었습니다.'
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// Admin 프로필 조회
export const getAdminProfile = async (req, res) => {
  res.json({
    admin: req.admin
  });
};
