/* ------------------------------------------------------------
 * File      : /src/controllers/orderController.js
 * Brief     : 주문 관련 컨트롤러
 * Author    : 송용훈
 * Date      : 2025-08-14
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import mongoose from 'mongoose';
import { generateOrderNumber } from '../utils/generateOrderNumber.js';

// 주문 생성 (결제)
export const createOrder = async (req, res) => {
  // -- 1. 주문 번호 채번 (트랜잭션 외부) ---
  // ---- 이 작업은 롤백되어서는 안 되므로 트랜잭션 밖에서 수행합니다.
  // ---- 이렇게 하면 다른 트랜잭션이 실패하고 롤백되더라도 시퀀스는 이미 증가했으므로
  // ---- 중복된 주문 번호가 생성되는 것을 방지할 수 있습니다.
  const orderNumber = await generateOrderNumber();

  // -- 2. 주문 생성 트랜잭션 시작 ---
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 유효성 검사
    // -- 결제 수단 검증
    const { paymentMethod = 'card' } = req.body;
    const validPaymentMethods = ['card', 'cash', 'point'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      await session.abortTransaction();
      return res.status(400).json({ message: '유효하지 않은 결제 수단입니다.' });
    }

    // -- 사용자 조회
    const userId = req.user._id;  // .id → ._id로 수정
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // -- 카트가 비어있는지 확인
    if (!user.cart || user.cart.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: '장바구니가 비어있습니다.' });
    }

    // -- 카트 아이템들의 상품 정보 조회
    const productIds = user.cart.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).session(session);
    const productMap = new Map(products.map(product => [product._id.toString(), product]));

    // -- 주문 아이템 생성 및 재고 확인
    const orderItems = [];
    let totalPrice = 0;

    // -- 주문 아이템 검증
    for (const cartItem of user.cart) {
      const product = productMap.get(cartItem.productId.toString());

      // 카트 물품 재확인 - 사용자가 상품을 카트에 담았는데, 관리작 그 상품을 삭제한 경우 처리
      if (!product) {
        await session.abortTransaction();
        return res.status(400).json({ message: '존재하지 않는 상품이 포함되어 있습니다.' });
      }

      // 재고 확인 - 프론트에서도 처리하지만, 백엔드도 한번 더 재고 확인
      if (product.currentStock < cartItem.quantity) {
        await session.abortTransaction();
        return res.status(400).json({ 
          message: `${product.productName}의 재고가 부족합니다. (현재 재고: ${product.currentStock}개, 주문 수량: ${cartItem.quantity}개)` 
        });
      }

      // 재고 차감
      product.currentStock -= cartItem.quantity;
      await product.save({ session });

      // 확인된 주문 아이템 푸쉬
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

    // -- 주문 생성
    const order = new Order({
      userId: user._id,
      orderNumber: orderNumber, // 외부에서 생성된 주문번호를 할당
      items: orderItems,
      totalPrice: totalPrice,
      paymentMethod: paymentMethod
    });

    await order.save({ session });

    // -- 카트 비우기
    user.cart = [];
    await user.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: '주문이 완료되었습니다.'
    });

  } catch (error) {
    await session.abortTransaction();

    // E11000 중복 키 오류(orderNumber)인지 확인하여 멱등성 처리
    if (error.name === 'MongoServerError' && error.code === 11000 && error.keyPattern && error.keyPattern.orderNumber === 1) {
      console.log(`[ORDER_CREATE] Gracefully handling duplicate key error for orderNumber: ${orderNumber}. Ensuring cart is cleared.`);
      
      const userId = req.user._id;
      await User.findByIdAndUpdate(userId, { $set: { cart: [] } });

      return res.json({
        success: true,
        message: '주문이 성공적으로 처리되었습니다 (중복 요청).',
        isDuplicate: true
      });
    }

    // 그 외 다른 모든 오류 (500)
    console.error('[ERROR] 주문 생성 중 심각한 오류 발생:', {
      error: error.message,
      orderNumber: orderNumber, // 실패한 주문 번호 로깅
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

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate({
        path: 'items.productId',
        select: 'category'
      });

    const total = await Order.countDocuments({ userId });

    res.json({
      orders: orders.map(order => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        items: order.items.map(item => ({
          productId: item.productId ? item.productId._id : null,
          productName: item.productName,
          productImg: item.productImg,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
          category: item.productId ? item.productId.category : null
        })),
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
    console.error('[ERROR] 주문 목록 조회 오류:', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error.message 
    });
  }
};

