// index.js

import { aggregateSummaryStats } from "./aggregators/summaryStats.js";
import { aggregateBestSellers } from "./aggregators/bestSellers.js";
import { aggregateGoldenPath } from "./aggregators/goldenPath.js";
import { aggregatePurchaseGoldenPath } from "./aggregators/purchaseGoldenPathStats.js";
// 새로 만든 RAG 집계 함수를 import
import { aggregateRagUnifiedSummary } from "./aggregators/ragUnifiedSummary.js";

import schedule from "node-schedule"; // cron 스타일 스케줄링

// 설정 파일에서 이 워커의 고유 이름을 가져옵니다.
// 각 워커는 고유한 이름을 가지며, 같은 Redis Consumer Group 안에서 중복 없이 메시지를 처리합니다.
import { REDIS_CONSUMER_NAME } from "./config/config.js";

// Redis 스트림을 읽고 쓰는 데 필요한 기능들을 가져옵니다.
// - ensureConsumerGroup: 소비자 그룹이 없으면 생성
// - readMessages: 메시지 읽기
// - ackMessages: 메시지 처리 완료 후 확인(ACK)
import {
  ensureConsumerGroup,
  readMessages,
  ackMessages,
} from "./redis/redisClient.js";

// 메시지를 실제로 처리하는 비즈니스 로직이 들어있는 모듈입니다.
// 예: ClickHouse에 저장, 로그 집계 등
import { processMessages } from "./processor.js";

// 콘솔이나 파일에 로그를 남기기 위한 로거 모듈입니다.
// logger.info(), logger.error() 등의 함수로 로그를 기록할 수 있습니다.
import * as logger from "./logger.js";

// 비동기 루프 함수: 메시지를 계속해서 처리하는 역할
async function workerLoop() {
  // 시작 전에, Redis 스트림에 이 워커가 속할 소비자 그룹이 존재하는지 확인하고,
  // 없다면 새로 생성합니다.
  await ensureConsumerGroup();

  // 무한 루프를 통해 계속 메시지를 수신하고 처리함
  while (true) {
    try {
      // 현재 워커 이름으로 Redis 스트림에서 새 메시지를 읽어옵니다.
      const messages = await readMessages(REDIS_CONSUMER_NAME);

      // 읽어온 메시지가 없다면 대기 상태로 전환
      if (messages.length === 0) {
        logger.info("No new messages. Waiting...");
        continue; // 메시지가 없으므로 루프 반복
      }

      // 메시지가 있다면 실제 처리 로직으로 넘깁니다.
      // 이 함수는 각 메시지를 순회하며 비즈니스 로직 수행합니다.
      await processMessages(messages);

      // 처리한 메시지들에 대해 ACK(확인)를 Redis에 보냅니다.
      // 이는 메시지가 성공적으로 처리됐음을 Redis에게 알려주는 역할로,
      // 다시 같은 메시지를 처리하지 않도록 보장합니다.
      const ids = messages.map((m) => m[0]); // 메시지 ID 목록 추출
      await ackMessages(ids);
    } catch (err) {
      // 예외가 발생했다면 에러 로그를 찍고, 3초 대기 후 루프 재시작
      logger.error("Worker error:", err);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

// 루프를 시작합니다.
// 혹시라도 시작부터 에러가 발생하면, 치명적 에러로 간주하고 프로세스를 종료합니다.
workerLoop().catch((err) => {
  logger.error("Worker fatal error:", err);
  process.exit(1); // 비정상 종료
});

// ---------------- 밑은 사전집계

/**
 * 모든 사전 집계 함수를 실행
 */
async function runAllAggregations() {
  try {
    console.log("[Worker] Aggregation started");

    // 1. 개별 사전 집계 테이블들을 먼저 생성합니다.
    await aggregateSummaryStats("weekly");
    await aggregateSummaryStats("monthly");

    await aggregateBestSellers("weekly");
    await aggregateBestSellers("monthly");

    await aggregateGoldenPath("weekly");
    await aggregateGoldenPath("monthly");

    await aggregatePurchaseGoldenPath("monthly");
    await aggregatePurchaseGoldenPath("monthly");

    console.log(
      "[Worker] Individual aggregations completed. Starting RAG unified aggregation..."
    );

    // 2. 위 테이블들을 기반으로 최종 RAG 통합 테이블을 생성합니다.
    await aggregateRagUnifiedSummary("weekly");
    await aggregateRagUnifiedSummary("monthly");

    console.log("[Worker] All aggregations completed successfully");
  } catch (err) {
    console.error("[Worker] Aggregation error:", err);
  }
}

/**
 * 스케줄러 설정
 * 매일 새벽 3시에 실행
 */
schedule.scheduleJob("0 3 * * *", () => {
  console.log("[Scheduler] Running scheduled aggregation");
  runAllAggregations();
});

// 서버 시작 시 한 번 실행
runAllAggregations();
