/* ------------------------------------------------------------
 * File      : /models/Product.js
 * Brief     : Product 모델 정의
 * Author    : 송용훈
 * Date      : 2025-08-08
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  productCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
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
  productContents: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['beverage', 'food', 'goods'],
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

export default mongoose.model('Product', productSchema);
