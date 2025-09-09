/* ------------------------------------------------------------
 * File      : /models/Promotion.js
 * Brief     : Promotion 모델 정의
 * Author    : 송용훈
 * Date      : 2025-08-08
 * Version   : 
 * History
 *  - 2025-08-08 생성 (송용훈)
 * ------------------------------------------------------------*/

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
  promotionOrder: {
    type: Number,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

// 인덱스 설정
promotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
promotionSchema.index({ promotionOrder: 1, createdAt: -1 });

// 정적 메서드: 만료된 프로모션 자동 비활성화
promotionSchema.statics.deactivateExpiredPromotions = async function() {
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
      console.log(`✅ ${result.modifiedCount}개의 만료된 프로모션이 자동으로 비활성화되었습니다.`);
    }
    
    return result.modifiedCount;
  } catch (error) {
    console.error('❌ 만료된 프로모션 비활성화 실패:', error);
    throw error;
  }
};

// 인스턴스 메서드 : 현재 활성 여부를 반환
promotionSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && this.startDate <= now && this.endDate >= now;
};

// 인스턴스 메서드: 상태 출력
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
