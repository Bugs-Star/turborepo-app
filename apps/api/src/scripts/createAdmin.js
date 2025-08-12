import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';

// 환경변수 로드
dotenv.config();

const createAdmin = async () => {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB 연결 성공');

    // 관리자 정보 (환경변수에서 가져오거나 기본값 사용)
    const adminData = {
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      passwordHash: process.env.ADMIN_PASSWORD || 'admin123',
      name: process.env.ADMIN_NAME || '관리자',
      profileImg: process.env.ADMIN_PROFILE_IMG || null,
      status: 'active'
    };

    // 기존 관리자 확인
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('⚠️  이미 존재하는 관리자 계정입니다.');
      console.log(`이메일: ${existingAdmin.email}`);
      console.log(`이름: ${existingAdmin.name}`);
      return;
    }

    // 새 관리자 생성
    const admin = new Admin(adminData);
    await admin.save();

    console.log('✅ 관리자 계정이 성공적으로 생성되었습니다!');
    console.log(`이메일: ${admin.email}`);
    console.log(`이름: ${admin.name}`);
    console.log(`상태: ${admin.status}`);

  } catch (error) {
    console.error('❌ 관리자 계정 생성 실패:', error.message);
  } finally {
    // MongoDB 연결 종료
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  }
};

// 스크립트 실행
createAdmin();
