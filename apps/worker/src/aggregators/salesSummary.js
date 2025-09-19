// src/aggregators/summaryStats.js
import clickhouse from "../clickhouse/clickhouseClient.js";

/**
 * sales_summary_by_period 사전 집계 (일/주/월/년 지원)
 * @param {'daily'|'weekly'|'monthly'|'yearly'} periodType
 */
export async function aggregateSalesSummary(periodType = "monthly") {
  let dateFunc;
  let intervalDays;

  // 1️⃣ periodType에 따라 함수와 기간을 동적으로 설정
  switch (periodType) {
    case "daily":
      dateFunc = "toDate"; // 날짜 단위로 그룹화
      intervalDays = 7; // 최근 7일치 데이터를 매일 재집계
      break;
    case "weekly":
      dateFunc = "toStartOfWeek";
      intervalDays = 30; // 최근 30일치 데이터를 재집계
      break;
    case "monthly":
      dateFunc = "toStartOfMonth";
      intervalDays = 90; // 최근 90일치 데이터를 재집계
      break;
    case "yearly":
      dateFunc = "toStartOfYear";
      intervalDays = 730; // 최근 2년치 데이터를 재집계
      break;
    default:
      // 지원하지 않는 periodType이 들어오면 에러 발생
      throw new Error(`Unsupported periodType: ${periodType}`);
  }

  // 2️⃣ 새로운 집계 삽입 (ReplacingMergeTree 엔진이 중복을 자동 처리)
  const insertQuery = `
    INSERT INTO sales_summary_by_period
    SELECT
      '${periodType}' AS period_type,
      ${dateFunc}(ordered_at) AS period_start,
      store_id,
      SUM(total_price) AS total_sales,
      COUNT(*) AS total_orders,
      AVG(total_price) AS avg_order_value,
      COUNT(DISTINCT user_id) AS unique_customers,
      COUNT(DISTINCT session_id) AS total_customers,
      now() AS created_at
    FROM orders
    WHERE ordered_at >= today() - INTERVAL ${intervalDays} DAY
    GROUP BY store_id, period_start
  `;

  await clickhouse.exec({ query: insertQuery });
  console.log(`[Worker] ${periodType} summary stats aggregated (Optimized)`);
}

// // src/aggregators/summaryStats.js
// import clickhouse from "../clickhouse/clickhouseClient.js";

// /**
//  * sales_summary_by_period 사전 집계
//  * @param {'weekly'|'monthly'} periodType
//  */
// export async function aggregateSummaryStats(periodType = "monthly") {
//   const dateFunc =
//     periodType === "monthly" ? "toStartOfMonth" : "toStartOfWeek";
//   const intervalDays = periodType === "monthly" ? 90 : 30;

//   // 1️⃣ 기존 동일 기간/매장 집계 삭제
//   const deleteQuery = `
//     ALTER TABLE sales_summary_by_period
//     DELETE WHERE period_type = '${periodType}'
//       AND period_start >= today() - INTERVAL ${intervalDays} DAY
//   `;
//   await clickhouse.exec({ query: deleteQuery });

//   // 2️⃣ 새로운 집계 삽입
//   const insertQuery = `
//     INSERT INTO sales_summary_by_period
//     SELECT
//       '${periodType}' AS period_type,
//       ${dateFunc}(ordered_at) AS period_start,
//       store_id,
//       SUM(total_price) AS total_sales,
//       COUNT(*) AS total_orders,
//       AVG(total_price) AS avg_order_value,
//       COUNT(DISTINCT user_id) AS unique_customers,
//       now() AS created_at
//     FROM orders
//     WHERE ordered_at >= today() - INTERVAL ${intervalDays} DAY
//     GROUP BY store_id, period_start
//   `;

//   await clickhouse.exec({ query: insertQuery });
//   console.log(`[Worker] ${periodType} summary stats aggregated`);
// }
