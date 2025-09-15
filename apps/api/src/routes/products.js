/* ------------------------------------------------------------
 * File      : /src/routes/products.js
 * Brief     : 상품 관련 라우트
 * Author    : 송용훈
 * Date      : 2025-08-15
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import { Router } from 'express';
import { getProducts, getProduct } from '../controllers/productController.js';

const router = Router();

router.get('/', getProducts);                    // 상품 목록 조회
router.get('/:id', getProduct);                  // 특정 상품 조회

export default router;
