import { Router } from 'express';
import { adminLogin, adminRefresh, adminLogout, getUsers } from '../controllers/adminController.js';
import { 
  createProduct, 
  updateProduct, 
  deleteProduct,
  reorderRecommendedProducts
} from '../controllers/productController.js';
import { 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  reorderEvents
} from '../controllers/eventController.js';
import { 
  createPromotion, 
  updatePromotion, 
  deletePromotion,
  reorderPromotions
} from '../controllers/promotionController.js';
import { 
  getAllOrders, 
  getUserOrders
} from '../controllers/adminOrderController.js';
import { adminAuth } from '../middlewares/adminAuth.js';
import { uploadFields } from '../middlewares/upload.js';

const router = Router();

// 관리자 인증 라우트
router.post('/login', adminLogin);
router.post('/refresh', adminRefresh);
router.post('/logout', adminAuth, adminLogout);

// 유저 관리 라우트
router.get('/users', adminAuth, getUsers);                    // 일반 유저 목록 조회

// 상품 관리 라우트 (목록 조회는 공통 API 사용)
router.post('/products', adminAuth, uploadFields, createProduct);      // 상품 등록
router.put('/products/:id', adminAuth, uploadFields, updateProduct);   // 상품 수정
router.delete('/products/:id', adminAuth, deleteProduct); // 상품 삭제
router.post('/products/reorder-recommended', adminAuth, reorderRecommendedProducts); // 추천 상품 순서 변경

// 이벤트 관리 라우트
router.post('/events', adminAuth, uploadFields, createEvent);      // 이벤트 등록
router.put('/events/:id', adminAuth, uploadFields, updateEvent);   // 이벤트 수정
router.delete('/events/:id', adminAuth, deleteEvent); // 이벤트 삭제
router.post('/events/reorder', adminAuth, reorderEvents); // 이벤트 순서 변경

// 프로모션 관리 라우트
router.post('/promotions', adminAuth, uploadFields, createPromotion);      // 프로모션 등록
router.put('/promotions/:id', adminAuth, uploadFields, updatePromotion);   // 프로모션 수정
router.delete('/promotions/:id', adminAuth, deletePromotion); // 프로모션 삭제
router.post('/promotions/reorder', adminAuth, reorderPromotions); // 프로모션 순서 변경

// 주문 관리 라우트
router.get('/order', adminAuth, getAllOrders);                    // 모든 주문 목록 조회
router.get('/order/:userId', adminAuth, getUserOrders);           // 특정 사용자 주문 목록 조회

export default router;
