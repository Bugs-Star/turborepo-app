/* ------------------------------------------------------------
 * File      : /src/routes/logs.js
 * Brief     : 로그 관련 라우트
 * Author    : 송용훈
 * Date      : 2025-09-01
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import { Router } from "express";
import { handleBatchLogs, handleImmediateLogs } from "../controllers/logController.js";

const router = Router();

router.post("/batch", handleBatchLogs);           // 일반 로그 수신 (배치 처리)
router.post("/immediate", handleImmediateLogs);   // 중요 로그 수신 (즉시 처리)

export default router;
