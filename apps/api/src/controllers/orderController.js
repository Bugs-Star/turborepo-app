import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import mongoose from 'mongoose';

// 주문 생성 (결제)
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;  // .id → ._id로 수정
    const { paymentMethod = 'card' } = req.body;

    // Fetch 요청 로그
    // console.log('[FETCH] 주문 생성 요청:', {
    //   method: req.method,
    //   url: req.originalUrl,
    //   userId: userId,
    //   paymentMethod: paymentMethod,
    //   userAgent: req.get('User-Agent'),
    //   timestamp: new Date().toISOString()
    // });

    // 결제 수단 검증
    const validPaymentMethods = ['card', 'cash', 'point'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      await session.abortTransaction();
      return res.status(400).json({ message: '유효하지 않은 결제 수단입니다.' });
    }

    // 사용자 조회
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 카트가 비어있는지 확인
    if (!user.cart || user.cart.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: '장바구니가 비어있습니다.' });
    }

    // 카트 아이템들의 상품 정보 조회
    const productIds = user.cart.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).session(session);
    const productMap = new Map(products.map(product => [product._id.toString(), product]));

    // 주문 아이템 생성 및 재고 확인
    const orderItems = [];
    let totalPrice = 0;

    for (const cartItem of user.cart) {
      const product = productMap.get(cartItem.productId.toString());
      
      if (!product) {
        await session.abortTransaction();
        return res.status(400).json({ message: '존재하지 않는 상품이 포함되어 있습니다.' });
      }

      // 재고 확인
      if (product.currentStock < cartItem.quantity) {
        await session.abortTransaction();
        return res.status(400).json({ 
          message: `${product.productName}의 재고가 부족합니다. (현재 재고: ${product.currentStock}개, 주문 수량: ${cartItem.quantity}개)` 
        });
      }

      // 재고 차감
      product.currentStock -= cartItem.quantity;
      await product.save({ session });

      // 주문 아이템 생성
      const subtotal = product.price * cartItem.quantity;
      totalPrice += subtotal;

      orderItems.push({
        productId: product._id,
        productName: product.productName,
        productImg: product.productImg,
        price: product.price,
        quantity: cartItem.quantity,
        subtotal: subtotal
      });
    }

    // 주문번호 생성
    const today = new Date();
    const dateStr = today.getFullYear().toString() +
                   (today.getMonth() + 1).toString().padStart(2, '0') +
                   today.getDate().toString().padStart(2, '0');
    
    // 오늘 날짜의 마지막 주문번호 찾기 (세션 사용)
    const lastOrder = await Order.findOne({
      orderNumber: new RegExp(`^${dateStr}-`)
    }).session(session).sort({ orderNumber: -1 });
    
    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.split('-')[1]);
      sequence = lastSequence + 1;
    }
    
    const orderNumber = `${dateStr}-${sequence.toString().padStart(5, '0')}`;

    // 주문 생성
    const order = new Order({
      userId: user._id,
      orderNumber: orderNumber,
      items: orderItems,
      totalPrice: totalPrice,
      paymentMethod: paymentMethod
    });

    await order.save({ session });

    // 카트 비우기
    user.cart = [];
    await user.save({ session });

    await session.commitTransaction();

    // Fetch 응답 로그
    // console.log('[FETCH] 주문 생성 완료:', {
    //   orderNumber: orderNumber,
    //   totalPrice: totalPrice,
    //   itemCount: orderItems.length,
    //   timestamp: new Date().toISOString()
    // });

    res.json({
      success: true,
      message: '주문이 완료되었습니다.'
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('[FETCH ERROR] 주문 생성 오류:', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};

// 내 주문 목록 조회 (일반 사용자용)
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;  // .id → ._id로 수정
    const { page = 1, limit = 10 } = req.query;

    // Fetch 요청 로그
    // console.log('[FETCH] 주문 목록 조회 요청:', {
    //   method: req.method,
    //   url: req.originalUrl,
    //   userId: userId,
    //   page: page,
    //   limit: limit,
    //   userAgent: req.get('User-Agent'),
    //   timestamp: new Date().toISOString()
    // });

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('items.productId', 'productName productImg price');

    const total = await Order.countDocuments({ userId });

    // Fetch 응답 로그
    // console.log('[FETCH] 주문 목록 조회 완료:', {
    //   foundOrders: orders.length,
    //   totalOrders: total,
    //   timestamp: new Date().toISOString()
    // });

    res.json({
      orders: orders.map(order => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        items: order.items,
        totalPrice: order.totalPrice,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total
      }
    });

  } catch (error) {
    console.error('[FETCH ERROR] 주문 목록 조회 오류:', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error.message 
    });
  }
};

// 주문 상세 조회
export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: '유효하지 않은 주문 ID입니다.' });
    }

    // 관리자인지 일반 사용자인지 확인
    const isAdmin = req.admin;
    const userId = req.user?._id;  // .id → ._id로 수정

    // Fetch 요청 로그
    console.log('[FETCH] 주문 상세 조회 요청:', {
      method: req.method,
      url: req.originalUrl,
      orderId: orderId,
      userId: userId,
      isAdmin: isAdmin,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    let query = { _id: orderId };

    if (!isAdmin) {
      // 일반 사용자: 자신의 주문만 조회
      if (!userId) {
        return res.status(401).json({ message: '인증이 필요합니다.' });
      }
      query.userId = userId;
    }

    const order = await Order.findOne(query)
      .populate('userId', 'name email')  // 사용자 정보 포함
      .populate('items.productId', 'productName productImg price category');

    if (!order) {
      return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
    }

    // Fetch 응답 로그
    console.log('[FETCH] 주문 상세 조회 완료:', {
      orderNumber: order.orderNumber,
      totalPrice: order.totalPrice,
      timestamp: new Date().toISOString()
    });

    res.json({
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        userId: isAdmin ? {
          _id: order.userId._id,
          name: order.userId.name,
          email: order.userId.email
        } : undefined,
        items: order.items,
        totalPrice: order.totalPrice,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });

  } catch (error) {
    console.error('[FETCH ERROR] 주문 상세 조회 오류:', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};


