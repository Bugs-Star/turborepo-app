import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
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
  bannerImg: {
    type: String,
    required: true,
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
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

// 이벤트 활성 상태 확인 메서드
eventSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
};

// 이벤트 상태를 반환하는 메서드
eventSchema.methods.getStatus = function() {
  const now = new Date();
  
  if (!this.isActive) {
    return 'inactive';
  }
  
  if (now < this.startDate) {
    return 'upcoming';
  } else if (now > this.endDate) {
    return 'expired';
  } else {
    return 'active';
  }
};

export default mongoose.model('Event', eventSchema);
