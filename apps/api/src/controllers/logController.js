/* ------------------------------------------------------------
 * File      : /src/controllers/logController.js
 * Brief     : 로그 관련 컨트롤러
 * Author    : 송용훈
 * Date      : 2025-09-01
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import { validateLogs } from "../utils/logValidator.js";
import Redis from "ioredis";
const redisClient = new Redis(process.env.REDIS_URL);

// 일반 로그 수신 (배치 처리)
export const handleBatchLogs = async (req, res) => {
  try {
    const validation = validateLogs(req.body);
    if (!validation.isValid) {
      console.error("[batch 검증 실패]", validation.error);
      return res.status(400).json({ success: false, error: validation.error });
    }

    const { logs } = req.body;
    console.log("[batch 로그]");
    logs.forEach((log, index) => console.log(`[${index + 1}]`, JSON.stringify(log, null, 2)));

    const pipeline = redisClient.pipeline();
    logs.forEach((log) => {
      pipeline.xadd("batch_logs_stream", "*", "data", JSON.stringify(log));
    });
    await pipeline.exec();

    res.json({ success: true, received: validation.count });
  } catch (error) {
    console.error("배치 로그 처리 오류:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

// 중요 로그 수신 (즉시 처리)
export const handleImmediateLogs = async (req, res) => {
  try {
    const validation = validateLogs(req.body);
    if (!validation.isValid) {
      console.error("[immediate 검증 실패]", validation.error);
      return res.status(400).json({ success: false, error: validation.error });
    }

    const { logs } = req.body;
    console.log("[immediate 로그]");
    logs.forEach((log, index) => console.log(`[${index + 1}]`, log));

    const pipeline = redisClient.pipeline();
    logs.forEach((log) => {
      pipeline.xadd("immediate_logs_stream", "*", "data", JSON.stringify(log));
    });
    await pipeline.exec();

    res.json({ success: true, message: `${validation.count}개의 중요 로그를 수신했습니다.`, received: validation.count });
  } catch (error) {
    console.error("중요 로그 처리 오류:", error);
    res.status(500).json({ success: false, message: "중요 로그 처리 중 오류가 발생했습니다.", error: error.message });
  }
};

