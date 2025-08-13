import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { addToBlacklist } from '../config/redis.js';

// JWT 토큰 생성
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET이 설정되지 않았습니다.');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// 회원가입
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    console.log('회원가입 요청:', { email, name }); // 디버깅용

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

    console.log('유저 생성 성공:', user._id); // 디버깅용

    // 토큰 생성
    const token = generateToken(user._id);

    res.status(201).json({
      message: '회원가입이 완료되었습니다. 로그인해주세요.'
    });
  } catch (error) {
    console.error('회원가입 에러:', error); // 디버깅용
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error.message // 개발 중에만 사용
    });
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
  try {
    res.json({
        user: req.user
    });
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized - Invalid or missing token' });
  }
};

// 내 정보 수정 (이름, 비밀번호, 프로필 이미지) - 현재 비밀번호 확인 필요
export const updateProfile = async (req, res) => {
  try {
    const { name, newPassword, currentPassword } = req.body;
    const userId = req.user._id;

    console.log('프로필 수정 요청:', { 
      name: !!name, 
      newPassword: !!newPassword, 
      hasImage: !!req.file,
      hasCurrentPassword: !!currentPassword 
    });

    // 현재 비밀번호 확인
    if (!currentPassword) {
      return res.status(400).json({ message: '현재 비밀번호를 입력해주세요.' });
    }

    // 현재 사용자 정보 가져오기 (비밀번호 포함)
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 현재 비밀번호 검증
    const isCurrentPasswordValid = await currentUser.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: '현재 비밀번호가 올바르지 않습니다.' });
    }

    // 업데이트할 데이터 준비
    const updateData = {};
    
    // 이름 수정
    if (name && name.trim()) {
      updateData.name = name.trim();
    }

    // 비밀번호 수정
    if (newPassword && newPassword.trim()) {
      // 새 비밀번호 해싱
      const bcrypt = await import('bcryptjs');
      updateData.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    // 프로필 이미지 수정
    if (req.file) {
      updateData.profileImg = `/uploads/${req.file.filename}`;
    }

    // 데이터가 없으면 에러
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: '업데이트할 데이터가 없습니다.' });
    }

    // 유저 정보 업데이트
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    console.log('프로필 수정 성공:', updatedUser._id);

    res.json({
      message: '프로필이 성공적으로 업데이트되었습니다.'
    });
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    res.status(500).json({ 
      message: '프로필 업데이트 중 오류가 발생했습니다.',
      error: error.message // 개발 중에만 사용
    });
  }
};

// 로그아웃
export const logout = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(400).json({ message: '토큰이 필요합니다.' });
    }

    // 토큰을 블랙리스트에 추가
    await addToBlacklist(token);

    res.json({
      message: '로그아웃이 완료되었습니다.'
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};
