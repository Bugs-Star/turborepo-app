import { Router } from 'express';
import {
  getEvents,
  getEvent
} from '../controllers/eventController.js';

const router = Router();

// 공통 이벤트 조회 라우트 (인증 불필요)
router.get('/', getEvents);                    // 이벤트 목록 조회
router.get('/:id', getEvent);                  // 특정 이벤트 조회

export default router;
