import mongoose from 'mongoose';

const advertisementSchema = new mongoose.Schema({
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
    required: true,
    trim: true
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
    min: 0,
    default: 0
  },
  targetAudience: {
    type: String,
    enum: ['all', 'new', 'returning', 'vip'],
    default: 'all'
  },
  displayLocation: {
    type: String,
    enum: ['home', 'menu', 'cart', 'checkout'],
    default: 'home'
  }
}, {
  timestamps: true
});

// 광고 활성 상태 확인 메서드
advertisementSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
};

// 광고 상태를 반환하는 메서드
advertisementSchema.methods.getStatus = function() {
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

export default mongoose.model('Advertisement', advertisementSchema);
