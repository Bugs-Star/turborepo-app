import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// JWT 토큰 생성
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// 회원가입
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '이미 존재하는 이메일입니다.' });
    }

    // 유저 생성
    const user = new User({ 
      email, 
      passwordHash: password, // 미들웨어에서 자동으로 해싱됨
      name 
    });
    await user.save();

    // 토큰 생성
    const token = generateToken(user._id);

    res.status(201).json({
      message: '회원가입이 완료되었습니다. 로그인해주세요.'
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 로그인
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 유저 찾기
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    // 비밀번호 확인
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    // 토큰 생성
    const token = generateToken(user._id);

    res.json({
      token,
      _id: user._id
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 내 정보 조회
export const getProfile = async (req, res) => {
  res.json({
    user: req.user
  });
};
