import { Router } from 'express';
import { adminLogin, adminLogout, getAdminProfile } from '../controllers/adminController.js';
import { adminAuth } from '../middlewares/adminAuth.js';
import {
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';

const router = Router();

// 인증 관련 라우트
router.post('/login', adminLogin);
router.post('/logout', adminAuth, adminLogout);
router.get('/profile', adminAuth, getAdminProfile);

// 관리자용 상품 관리 라우트 (인증 필요)
router.post('/products', adminAuth, createProduct);                    // 상품 등록
router.put('/products/:id', adminAuth, updateProduct);                 // 상품 수정
router.delete('/products/:id', adminAuth, deleteProduct);              // 상품 삭제

export default router;
