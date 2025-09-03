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

// 테스트 라우트 (메인 라우터에 직접 추가)
router.get('/order-test', (req, res) => {
  console.log('=== /order-test 라우트 진입 ===');
  res.json({ message: 'order-test route works from main router' });
});

export default router;