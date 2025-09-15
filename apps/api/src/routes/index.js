/* ------------------------------------------------------------
 * File      : /src/routes/index.js
 * Brief     : 라우트 index 파일
 * Author    : 송용훈
 * Date      : 2025-08-14
 * Version   : 
 * History
 * ------------------------------------------------------------*/

// src/routes/index.js
import { Router } from 'express';
import authRoutes from './auth.js';
import adminRoutes from './admin.js';
import productRoutes from './products.js';
import eventRoutes from './events.js';
import promotionRoutes from './promotions.js';
import cartRoutes from './cart.js';
import orderRoutes from './order.js';
import logRoutes from './logs.js';

const router = Router();

// 인증 관련 라우트
router.use('/auth', authRoutes);

// 관리자 관련 라우트
router.use('/admin', adminRoutes);

// 상품 관련 라우트
router.use('/products', productRoutes);

// 이벤트 관련 라우트
router.use('/events', eventRoutes);

// 프로모션 관련 라우트
router.use('/promotions', promotionRoutes);

// 카트 관련 라우트
router.use('/cart', cartRoutes);

// 주문 관련 라우트
router.use('/order', orderRoutes);

// 로그 관련 라우트
router.use('/logs', logRoutes);

export default router;
