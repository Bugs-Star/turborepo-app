import mongoose from 'mongoose';

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
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
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

// 주문번호 자동 생성 (YYYYMMDD-XXXXX 형식) - 세션이 있는 경우에만
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const today = new Date();
    const dateStr = today.getFullYear().toString() +
                   (today.getMonth() + 1).toString().padStart(2, '0') +
                   today.getDate().toString().padStart(2, '0');
    
    // 세션이 있는 경우 세션 사용, 없는 경우 일반 조회
    const query = this.constructor.findOne({
      orderNumber: new RegExp(`^${dateStr}-`)
    }).sort({ orderNumber: -1 });
    
    // 현재 세션 확인 (트랜잭션 중인지)
    if (this.$session) {
      query.session(this.$session);
    }
    
    const lastOrder = await query;
    
    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.split('-')[1]);
      sequence = lastSequence + 1;
    }
    
    this.orderNumber = `${dateStr}-${sequence.toString().padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);
