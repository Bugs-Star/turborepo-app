/* ------------------------------------------------------------
 * File      : /models/Admin.js
 * Brief     : Admin 모델 정의
 * Author    : 송용훈
 * Date      : 2025-08-08
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// admin Schema
const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true,
    select: false
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  roles: {
    type: [String],
    default: ['admin']
  },
  profileImg: {
    type: String,
    default: null
  },
  refreshToken: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

// 비밀번호 해싱 미들웨어
adminSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// 비밀번호 검증 메서드
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export default mongoose.model('Admin', adminSchema);
