import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  linkUrl: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  targetAudience: {
    type: String,
    enum: ['all', 'new', 'existing', 'vip'],
    default: 'all'
  },
  displayLocation: {
    type: String,
    enum: ['home', 'menu', 'cart', 'profile'],
    default: 'home'
  },
  clickCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 인덱스 설정
promotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
promotionSchema.index({ displayLocation: 1, targetAudience: 1 });
promotionSchema.index({ priority: -1, createdAt: -1 });

// 가상 필드: 현재 활성 상태
promotionSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.isActive && this.startDate <= now && this.endDate >= now;
});

// 인스턴스 메서드
promotionSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && this.startDate <= now && this.endDate >= now;
};

promotionSchema.methods.getStatus = function() {
  const now = new Date();
  
  if (!this.isActive) return 'inactive';
  if (this.startDate > now) return 'scheduled';
  if (this.endDate < now) return 'expired';
  return 'active';
};

// 스키마 옵션
promotionSchema.set('toJSON', { virtuals: true });
promotionSchema.set('toObject', { virtuals: true });

export default mongoose.model('Promotion', promotionSchema);
