import { Router } from 'express';
import { adminLogin, adminLogout, adminRefresh, getAdminProfile } from '../controllers/adminController.js';
import { adminAuth } from '../middlewares/adminAuth.js';
import {
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getAdminEvents,
  getAdminEvent
} from '../controllers/eventController.js';
import {
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  getAdminAdvertisements,
  getAdminAdvertisement
} from '../controllers/advertisementController.js';
import upload from '../middlewares/upload.js';

const router = Router();

// 인증 관련 라우트
router.post('/login', adminLogin);
router.post('/refresh', adminRefresh);               // 토큰 갱신
router.post('/logout', adminAuth, adminLogout);
router.get('/profile', adminAuth, getAdminProfile);

// 관리자용 상품 관리 라우트 (인증 필요)
router.post('/products', adminAuth, upload, createProduct);                   // 상품 등록
router.put('/products/:id', adminAuth, upload, updateProduct);                // 상품 수정
router.delete('/products/:id', adminAuth, deleteProduct);                     // 상품 삭제

// 관리자용 이벤트 관리 라우트 (인증 필요)
router.get('/events', adminAuth, getAdminEvents);                     // 이벤트 목록 조회 (생성자 정보 포함)
router.get('/events/:id', adminAuth, getAdminEvent);                  // 특정 이벤트 조회 (생성자 정보 포함)
router.post('/events', adminAuth, upload, createEvent);                    // 이벤트 등록
router.put('/events/:id', adminAuth, upload, updateEvent);                 // 이벤트 수정
router.delete('/events/:id', adminAuth, deleteEvent);                 // 이벤트 삭제

// 관리자용 광고 관리 라우트 (인증 필요)
router.get('/advertisements', adminAuth, getAdminAdvertisements);     // 광고 목록 조회 (생성자 정보 포함)
router.get('/advertisements/:id', adminAuth, getAdminAdvertisement);  // 특정 광고 조회 (생성자 정보 포함)
router.post('/advertisements', adminAuth, upload, createAdvertisement);      // 광고 등록
router.put('/advertisements/:id', adminAuth, upload, updateAdvertisement);   // 광고 수정
router.delete('/advertisements/:id', adminAuth, deleteAdvertisement); // 광고 삭제

export default router;
