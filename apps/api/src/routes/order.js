import express from 'express';
import { auth } from '../middlewares/auth.js';
import { adminAuth } from '../middlewares/adminAuth.js';
import {
  createOrder,
  getMyOrders,
  getOrder
} from '../controllers/orderController.js';

const router = express.Router();

// 주문 생성 (결제) - 일반 사용자만
router.post('/', auth, createOrder);

// 내 주문 목록 조회 - 일반 사용자만
router.get('/', auth, getMyOrders);

// 주문 상세 조회 - 관리자 또는 일반 사용자
router.get('/:orderId', [auth, adminAuth], getOrder);

export default router;
