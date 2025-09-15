/* ------------------------------------------------------------
 * File      : /src/routes/admin.js
 * Brief     : 관리자 관련 라우트
 * Author    : 송용훈
 * Date      : 2025-08-15
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import { Router } from 'express';
import { adminAuth } from '../middlewares/adminAuth.js';
import { uploadFields } from '../middlewares/upload.js';

import { adminLogin, adminRefresh, adminLogout, getMe } from '../controllers/adminController.js';
import { createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { reorderRecommendedProducts } from '../controllers/reorder/productReorder.js';
import { createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { reorderEvents } from '../controllers/reorder/eventReorder.js';
import { createPromotion, updatePromotion, deletePromotion } from '../controllers/promotionController.js';
import { reorderPromotions } from '../controllers/reorder/promotionReorder.js';
import { getUsers, getUserOrders } from '../controllers/adminOrderController.js';
import { getReports } from '../controllers/reportController.js';

const router = Router();

// 관리자 인증 라우트
router.post('/login', adminLogin);                  // 관리자 로그인
router.get('/me', adminAuth, getMe);                // 현재 로그인한 관리자 정보 조회
router.post('/refresh', adminRefresh);              // 관리자 토큰 갱신
router.post('/logout', adminAuth, adminLogout);     // 관리자 로그아웃

// 상품 관리 라우트 (목록 조회는 공통 API 사용)
router.post('/products', adminAuth, uploadFields, createProduct);                    // 상품 등록
router.put('/products/:id', adminAuth, uploadFields, updateProduct);                 // 상품 수정
router.delete('/products/:id', adminAuth, deleteProduct);                            // 상품 삭제
router.post('/products/reorder-recommended', adminAuth, reorderRecommendedProducts); // 추천 상품 순서 변경

// 이벤트 관리 라우트
router.post('/events', adminAuth, uploadFields, createEvent);          // 이벤트 등록
router.put('/events/:id', adminAuth, uploadFields, updateEvent);       // 이벤트 수정
router.delete('/events/:id', adminAuth, deleteEvent);                  // 이벤트 삭제
router.post('/events/reorder', adminAuth, reorderEvents);              // 이벤트 순서 변경

// 프로모션 관리 라우트
router.post('/promotions', adminAuth, uploadFields, createPromotion);      // 프로모션 등록
router.put('/promotions/:id', adminAuth, uploadFields, updatePromotion);   // 프로모션 수정
router.delete('/promotions/:id', adminAuth, deletePromotion);              // 프로모션 삭제
router.post('/promotions/reorder', adminAuth, reorderPromotions);          // 프로모션 아이템 순서 변경

// 유저 관리 라우트
router.get('/users', adminAuth, getUsers);                  // 일반 유저 목록 조회
router.get('/order/:userId', adminAuth, getUserOrders);     // 특정 사용자 주문 목록 조회

// 리포트 조회 라우트
router.get('/reports/:periodType', adminAuth, getReports);

export default router;
