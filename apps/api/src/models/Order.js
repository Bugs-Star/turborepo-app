/* ------------------------------------------------------------
 * File      : /models/Order.js
 * Brief     : Order 모델 정의
 * Author    : 송용훈
 * Date      : 2025-08-08
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import mongoose from 'mongoose';

// orderItem Schema
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productImg: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  subtotal: {
    type: Number,
    required: true
  }
}, { _id: false });  // 이 스키마는 단독으로 쓰이지 않고 orderSchema 안에 배열의 형태로 포함. 각 항목마다 별도의 _id를 생성하지 않도록 설정

// order Schema
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  items: [orderItemSchema],
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'point'],
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Order', orderSchema);
