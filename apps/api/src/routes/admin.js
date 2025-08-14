import { Router } from 'express';
import { adminLogin, adminRefresh, adminLogout } from '../controllers/adminController.js';
import { 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  getAdminProducts, 
  getAdminProduct 
} from '../controllers/productController.js';
import { 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  getAdminEvents, 
  getAdminEvent 
} from '../controllers/eventController.js';
import { 
  createPromotion, 
  updatePromotion, 
  deletePromotion, 
  getAdminPromotions, 
  getAdminPromotion 
} from '../controllers/promotionController.js';
import { adminAuth } from '../middlewares/adminAuth.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

// 관리자 인증 라우트
router.post('/login', adminLogin);
router.post('/refresh', adminRefresh);
router.post('/logout', adminAuth, adminLogout);

// 상품 관리 라우트
router.get('/products', adminAuth, getAdminProducts);     // 상품 목록 조회 (생성자 정보 포함)
router.get('/products/:id', adminAuth, getAdminProduct);  // 특정 상품 조회 (생성자 정보 포함)
router.post('/products', adminAuth, upload, createProduct);      // 상품 등록
router.put('/products/:id', adminAuth, upload, updateProduct);   // 상품 수정
router.delete('/products/:id', adminAuth, deleteProduct); // 상품 삭제

// 이벤트 관리 라우트
router.get('/events', adminAuth, getAdminEvents);     // 이벤트 목록 조회 (생성자 정보 포함)
router.get('/events/:id', adminAuth, getAdminEvent);  // 특정 이벤트 조회 (생성자 정보 포함)
router.post('/events', adminAuth, upload, createEvent);      // 이벤트 등록
router.put('/events/:id', adminAuth, upload, updateEvent);   // 이벤트 수정
router.delete('/events/:id', adminAuth, deleteEvent); // 이벤트 삭제

// 프로모션 관리 라우트
router.get('/promotions', adminAuth, getAdminPromotions);     // 프로모션 목록 조회 (생성자 정보 포함)
router.get('/promotions/:id', adminAuth, getAdminPromotion);  // 특정 프로모션 조회 (생성자 정보 포함)
router.post('/promotions', adminAuth, upload, createPromotion);      // 프로모션 등록
router.put('/promotions/:id', adminAuth, upload, updatePromotion);   // 프로모션 수정
router.delete('/promotions/:id', adminAuth, deletePromotion); // 프로모션 삭제

export default router;
