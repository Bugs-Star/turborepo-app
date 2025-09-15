/* ------------------------------------------------------------
 * File      : /src/routes/events.js
 * Brief     : 이벤트 관련 라우트
 * Author    : 송용훈
 * Date      : 2025-08-15
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import { Router } from 'express';
import { getEvents, getEvent } from '../controllers/eventController.js';

const router = Router();

router.get('/', getEvents);                    // 이벤트 목록 조회
router.get('/:id', getEvent);                  // 특정 이벤트 조회

export default router;
