import Order from '../models/Order.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// 모든 주문 목록 조회 (관리자용)
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name email')
      .populate('items.productId', 'productName productImg price');

    const total = await Order.countDocuments({});

    res.json({
      orders: orders.map(order => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        userId: {
          _id: order.userId._id,
          name: order.userId.name,
          email: order.userId.email
        },
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
    console.error('모든 주문 목록 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 특정 사용자 주문 목록 조회 (관리자용)
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: '유효하지 않은 사용자 ID입니다.' });
    }

    // 사용자 정보 먼저 조회
    const user = await User.findById(userId).select('name email');
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('items.productId', 'productName productImg price');

    const total = await Order.countDocuments({ userId });

    res.json({
      userId: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
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
    console.error('사용자 주문 목록 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};
