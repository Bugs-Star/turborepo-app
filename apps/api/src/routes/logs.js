// src/routes/logs.js
import { Router } from "express";
import { validateLogs } from "../utils/logValidator.js";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);
const router = Router();

// 일반 로그 수신 (배치 처리)
router.post("/batch", async (req, res) => {
  try {
    const validation = validateLogs(req.body);

    // 검증 실패 시
    if (!validation.isValid) {
      console.error("[batch 검증 실패]", validation.error);
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    // 검증 성공 시
    const { logs } = req.body;

    // [batch]디버그 로그
    console.log("[batch 로그]");
    logs.forEach((log, index) => {
      console.log(`[${index + 1}]`, log);

      // 🆕 products 배열만 추가로 표시
      if (log.payload && log.payload.products) {
        console.log(`[${index + 1}] 상품 정보:`, log.payload.products);
      }
    });

    // Redis Stream에 직접 추가
    const pipeline = redis.pipeline();
    logs.forEach((log) => {
      pipeline.xadd("batch_logs_stream", "*", "data", JSON.stringify(log));
    });
    await pipeline.exec();

    res.json({
      success: true,
      received: validation.count,
    });
  } catch (error) {
    // 이것은 예외 발생 시에만 실행됨 (예: JSON 파싱 오류 등)
    console.error("배치 로그 처리 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
});

// 중요 로그 수신 (즉시 처리)
router.post("/immediate", async (req, res) => {
  try {
    const validation = validateLogs(req.body);

    // 검증 실패 시
    if (!validation.isValid) {
      console.error("[immediate 검증 실패]", validation.error);
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    // 검증 성공 시
    const { logs } = req.body;

    // [immediate]디버그 로그
    console.log("[immediate 로그]");
    logs.forEach((log, index) => {
      console.log(`[${index + 1}]`, log);
    });

    // Redis Stream에 직접 추가
    const pipeline = redis.pipeline();
    logs.forEach((log) => {
      pipeline.xadd("immediate_logs_stream", "*", "data", JSON.stringify(log));
    });
    await pipeline.exec();

    res.json({
      success: true,
      message: `${validation.count}개의 중요 로그를 수신했습니다.`,
      received: validation.count,
    });
  } catch (error) {
    console.error("중요 로그 처리 오류:", error);
    res.status(500).json({
      success: false,
      message: "중요 로그 처리 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

export default router;
