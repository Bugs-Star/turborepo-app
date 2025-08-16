import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  adminId: {
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
  promotionImg: {
    type: String,
    required: true
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
  position: {
    type: String,
    enum: ['up', 'down'],
    default: 'up'
  }
}, {
  timestamps: true
});

// 인덱스 설정
promotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
promotionSchema.index({ position: -1, createdAt: -1 });

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
