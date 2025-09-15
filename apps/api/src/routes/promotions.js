/* ------------------------------------------------------------
 * File      : /src/routes/promotions.js
 * Brief     : 프로모션 관련 라우트
 * Author    : 송용훈
 * Date      : 2025-08-15
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import { Router } from 'express';
import { getPromotions, getPromotion } from '../controllers/promotionController.js';

const router = Router();

router.get('/', getPromotions);                    // 프로모션 목록 조회
router.get('/:id', getPromotion);                  // 특정 프로모션 조회

export default router;
