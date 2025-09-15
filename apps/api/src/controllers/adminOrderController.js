/* ------------------------------------------------------------
 * File      : /src/controllers/adminOrderController.js
 * Brief     : 주문 관련 컨트롤러
 * Author    : 송용훈
 * Date      : 2025-08-15
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import Order from '../models/Order.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// 일반 유저 목록 조회
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    // 현재 날짜 기준으로 이번 달의 시작과 끝 계산
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // 총 일반 유저 수
    const totalUsers = await User.countDocuments();

    // 이번 달 가입한 유저 수
    const newUsersThisMonth = await User.countDocuments({
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });

    // 유저 리스트 (이름, 이메일, 가입일)
    const users = await User.find()
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // 응답 데이터 구성
    const response = {
      summary: {
        totalUsers,
        newUsersThisMonth
      },
      users: users.map(user => ({
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNextPage: page < Math.ceil(totalUsers / limit),
        hasPrevPage: page > 1
      }
    };

    res.json(response);
  } catch (error) {
    console.error('유저 목록 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 일반 유저 주문 목록 조회
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
