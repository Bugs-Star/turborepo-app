import { Router } from 'express';
import {
  getProducts,
  getProduct,
  getRecommendedProducts
} from '../controllers/productController.js';

const router = Router();

// 공통 상품 조회 라우트 (인증 불필요)
router.get('/', getProducts);                    // 상품 목록 조회
router.get('/recommended', getRecommendedProducts); // 추천 상품 목록 조회
router.get('/:id', getProduct);                  // 특정 상품 조회

export default router;
