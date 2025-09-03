import express from 'express';
import { auth } from '../middlewares/auth.js';
import {
  createOrder,
  getMyOrders
} from '../controllers/orderController.js';

const router = express.Router();

// 주문 생성 (결제) - 일반 사용자만
router.post('/', auth, createOrder);

// 내 주문 목록 조회 - 일반 사용자만
router.get('/', auth, getMyOrders);

export default router;
