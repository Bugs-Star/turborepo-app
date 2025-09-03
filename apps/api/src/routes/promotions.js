import { Router } from 'express';
import { 
  getPromotions, 
  getPromotion 
} from '../controllers/promotionController.js';

const router = Router();

// 공개 프로모션 라우트
router.get('/', getPromotions);                    // 프로모션 목록 조회
router.get('/:id', getPromotion);                  // 특정 프로모션 조회

export default router;
