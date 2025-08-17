// src/routes/index.js
import { Router } from 'express';
import authRoutes from './auth.js';
import adminRoutes from './admin.js';
import productRoutes from './products.js';
import eventRoutes from './events.js';
import promotionRoutes from './promotions.js';
import cartRoutes from './cart.js';

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

export default router;