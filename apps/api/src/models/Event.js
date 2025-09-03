import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
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
  eventImg: {
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
  eventOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 인덱스 설정
eventSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
eventSchema.index({ eventOrder: -1, createdAt: -1 });

// 정적 메서드: 만료된 이벤트 자동 비활성화
eventSchema.statics.deactivateExpiredEvents = async function() {
  try {
    const now = new Date();
    const result = await this.updateMany(
      {
        isActive: true,
        endDate: { $lt: now }
      },
      {
        $set: { isActive: false }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ ${result.modifiedCount}개의 만료된 이벤트가 자동으로 비활성화되었습니다.`);
    }
    
    return result.modifiedCount;
  } catch (error) {
    console.error('❌ 만료된 이벤트 비활성화 실패:', error);
    throw error;
  }
};

// 인스턴스 메서드: 현재 활성 상태 확인
eventSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && this.startDate <= now && this.endDate >= now;
};

// 인스턴스 메서드: 이벤트 상태 반환
eventSchema.methods.getStatus = function() {
  const now = new Date();
  
  if (!this.isActive) return 'inactive';
  if (this.startDate > now) return 'scheduled';
  if (this.endDate < now) return 'expired';
  return 'active';
};

export default mongoose.model('Event', eventSchema);
