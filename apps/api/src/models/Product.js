import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  managedIds: [{
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    }
  }],
  productName: {
    type: String,
    required: true,
    trim: true
  },
  productImg: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  optimalStock: {
    type: Number,
    required: true,
    min: 0
  },
  isRecommended: {
    type: Boolean,
    default: false
  },
  recommendedOrder: {
    type: Number,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

// 재고 부족 여부를 확인하는 가상 필드
productSchema.virtual('isLowStock').get(function() {
  return this.currentStock < this.optimalStock;
});

// 재고 상태를 반환하는 메서드
productSchema.methods.getStockStatus = function() {
  if (this.currentStock === 0) {
    return 'out_of_stock';
  } else if (this.currentStock < this.optimalStock) {
    return 'low_stock';
  } else {
    return 'in_stock';
  }
};

// 관리자 권한 확인 메서드
productSchema.methods.canManage = function(adminId) {
  return this.managedIds.some(managed => managed.adminId.toString() === adminId.toString());
};

export default mongoose.model('Product', productSchema);
