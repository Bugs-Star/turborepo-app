import { Router } from 'express';
import {
  getAdvertisements,
  getAdvertisement,
  getActiveAdvertisements
} from '../controllers/advertisementController.js';

const router = Router();

// 공통 광고 조회 라우트 (인증 불필요)
router.get('/', getAdvertisements);                    // 광고 목록 조회
router.get('/active', getActiveAdvertisements);        // 활성 광고 목록 조회
router.get('/:id', getAdvertisement);                  // 특정 광고 조회

export default router;
