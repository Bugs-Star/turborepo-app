/* ------------------------------------------------------------
 * File      : /src/routes/order.js
 * Brief     : 주문 관련 라우트
 * Author    : 송용훈
 * Date      : 2025-08-14
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import express from 'express';
import { auth } from '../middlewares/auth.js';
import { createOrder, getMyOrders } from '../controllers/orderController.js';

// express.Router()
const router = express.Router();
router.post('/', auth, createOrder); // 주문 생성 (결제) - 일반 사용자만
router.get('/', auth, getMyOrders); // 내 주문 목록 조회 - 일반 사용자만

export default router;
