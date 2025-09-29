// index.js

import { aggregateBestSellers } from "./aggregators/bestSellers.js";
import { aggregateGoldenPath } from "./aggregators/goldenPath.js";
import { aggregatePurchaseGoldenPath } from "./aggregators/purchaseGoldenPathStats.js";
import { aggregateRagUnifiedSummary } from "./aggregators/ragUnifiedSummary.js";

import schedule from "node-schedule";

import { REDIS_CONSUMER_NAME } from "./config/config.js";

import {
  ensureConsumerGroup,
  readMessages,
  ackMessages,
  deleteMessages,
  trimStream
} from "./redis/redisClient.js";

import { processMessages } from "./processor.js";
import * as logger from "./logger.js";

import { initializeDatabase } from "./clickhouse/clickhouseClient.js";
import { aggregateSalesSummary } from "./aggregators/salesSummary.js";
import { aggregateVisitorSummary } from "./aggregators/visitorSummary.js";
import { aggregateKpiSummary } from "./aggregators/kpiSummary.js";
// <<-- 수정한 부분: 새로 만든 프로모션 집계 함수를 가져옵니다.
import { aggregatePromotionSummary } from "./aggregators/promotionSummary.js";

// 스트림 최대 길이
const STREAM_MAX_LEN = 1000;

// <<-- 수정한 부분: 모든 집계 함수를 배열로 관리하여 유지보수를 쉽게 합니다.
const ALL_AGGREGATIONS = [
  aggregateSalesSummary,
  aggregateVisitorSummary,
  aggregateBestSellers,
  aggregateGoldenPath,
  aggregatePurchaseGoldenPath,
  aggregateRagUnifiedSummary,
  aggregateKpiSummary,
  aggregatePromotionSummary, // 새로 추가한 프로모션 집계 포함
];

/**
 * 메인 애플리케이션을 시작하는 함수
 */
async function startApp() {
  await initializeDatabase();

  workerLoop().catch((err) => {
    logger.error("Worker fatal error:", err);
    process.exit(1);
  });

  // 매일 새벽 3시 스케줄링
  schedule.scheduleJob("0 3 * * *", () => {
    logger.info("[Scheduler] Running scheduled aggregation"); // console.log를 logger.info로 변경
    runAllAggregations();
  });

  // 서버 시작 시 즉시 한 번 실행
  logger.info("Running initial aggregations on startup..."); // 로그 추가
  runAllAggregations();
}

/**
 * 워커 루프: 메시지를 계속해서 처리
 */
async function workerLoop() {
  await ensureConsumerGroup();

  while (true) {
    try {
      const messages = await readMessages(REDIS_CONSUMER_NAME);

      if (messages.length === 0) {
        // logger.info 대신 logger.debug 또는 다른 레벨을 사용하거나, 로그 빈도를 줄일 수 있습니다.
        console.log("No new messages. Waiting..."); 
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }

      await processMessages(messages);

      const ids = messages.map((m) => m[0]);

      await ackMessages(ids);
      await deleteMessages(ids);
      await trimStream(STREAM_MAX_LEN);

      logger.info(`[Worker] Processed and deleted ${ids.length} messages.`); // console.log를 logger.info로 변경
    } catch (err) {
      logger.error("Worker error:", err);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

/**
 * 모든 사전 집계 실행
 */
// <<-- 수정한 부분: 순차 실행을 병렬 실행으로 변경하여 성능을 대폭 향상시킵니다.
async function runAllAggregations() {
  try {
    logger.info("[Aggregator] All aggregations started.");
    const periods = ["daily", "weekly", "monthly", "yearly"];

    // 각 주기별로 집계를 실행
    for (const period of periods) {
      logger.info(`[Aggregator] Running aggregations for period: ${period}`);
      
      // Promise.all을 사용해 해당 주기의 모든 집계를 병렬로 실행
      const aggregationPromises = ALL_AGGREGATIONS.map(aggFunc => aggFunc(period));
      await Promise.all(aggregationPromises);
      
      logger.info(`[Aggregator] Completed aggregations for period: ${period}`);
    }

    logger.info("[Aggregator] All aggregations completed successfully.");
  } catch (err) {
    logger.error("[Aggregator] Aggregation process failed:", err); // console.error를 logger.error로 변경
  }
}

// 애플리케이션 시작
startApp().catch((err) => {
  logger.error("Failed to start the application:", err); // console.error를 logger.error로 변경
  process.exit(1);
});

// // index.js

// import { aggregateBestSellers } from "./aggregators/bestSellers.js";
// import { aggregateGoldenPath } from "./aggregators/goldenPath.js";
// import { aggregatePurchaseGoldenPath } from "./aggregators/purchaseGoldenPathStats.js";
// import { aggregateRagUnifiedSummary } from "./aggregators/ragUnifiedSummary.js";

// import schedule from "node-schedule";

// import { REDIS_CONSUMER_NAME } from "./config/config.js";

// import {
//   ensureConsumerGroup,
//   readMessages,
//   ackMessages,
//   deleteMessages,  // 새로 추가: 메시지 삭제
//   trimStream       // 새로 추가: 스트림 길이 제한
// } from "./redis/redisClient.js";

// import { processMessages } from "./processor.js";
// import * as logger from "./logger.js";

// import { initializeDatabase } from "./clickhouse/clickhouseClient.js";
// import { aggregateSalesSummary } from "./aggregators/salesSummary.js";
// import { aggregateVisitorSummary } from "./aggregators/visitorSummary.js";
// import { aggregateKpiSummary } from "./aggregators/kpiSummary.js";

// // 스트림 최대 길이
// const STREAM_MAX_LEN = 1000;

// /**
//  * 메인 애플리케이션을 시작하는 함수
//  */
// async function startApp() {
//   await initializeDatabase();

//   workerLoop().catch((err) => {
//     logger.error("Worker fatal error:", err);
//     process.exit(1);
//   });

//   // 매일 새벽 3시 스케줄링
//   schedule.scheduleJob("0 3 * * *", () => {
//     console.log("[Scheduler] Running scheduled aggregation");
//     runAllAggregations();
//   });

//   // 서버 시작 시 즉시 한 번 실행
//   runAllAggregations();
// }

// /**
//  * 워커 루프: 메시지를 계속해서 처리
//  */
// async function workerLoop() {
//   await ensureConsumerGroup();

//   while (true) {
//     try {
//       const messages = await readMessages(REDIS_CONSUMER_NAME);

//       if (messages.length === 0) {
//         logger.info("No new messages. Waiting...");
//         await new Promise(r => setTimeout(r, 1000));
//         continue;
//       }

//       await processMessages(messages);

//       const ids = messages.map((m) => m[0]);

//       // ACK 처리
//       await ackMessages(ids);

//       // 처리한 메시지 삭제
//       await deleteMessages(ids);

//       // 스트림 길이 제한
//       await trimStream(STREAM_MAX_LEN);

//       console.log(`[Worker] 처리 및 삭제 완료: ${ids.length}건`);
//     } catch (err) {
//       logger.error("Worker error:", err);
//       await new Promise((r) => setTimeout(r, 3000));
//     }
//   }
// }

// /**
//  * 모든 사전 집계 실행
//  */
// async function runAllAggregations() {
//   try {
//     console.log("[Worker] Aggregation started");

//     for (const period of ["daily", "weekly", "monthly", "yearly"]) {
//       await aggregateSalesSummary(period);
//       await aggregateVisitorSummary(period);
//       await aggregateBestSellers(period);
//       await aggregateGoldenPath(period);
//       await aggregatePurchaseGoldenPath(period);
//       await aggregateRagUnifiedSummary(period);
//       await aggregateKpiSummary(period);
//     }

//     console.log("[Worker] All aggregations completed successfully");
//   } catch (err) {
//     console.error("[Worker] Aggregation error:", err);
//   }
// }

// // 애플리케이션 시작
// startApp().catch((err) => {
//   console.error("Failed to start the application:", err);
//   process.exit(1);
// });

