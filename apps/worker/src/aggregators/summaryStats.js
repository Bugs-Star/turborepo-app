// src/aggregators/summaryStats.js
import clickhouse from "../clickhouse/clickhouseClient.js";

/**
 * summary_stats_by_period 사전 집계
 * @param {'weekly'|'monthly'} periodType
 */
export async function aggregateSummaryStats(periodType = "monthly") {
  const dateFunc =
    periodType === "monthly" ? "toStartOfMonth" : "toStartOfWeek";
  const intervalDays = periodType === "monthly" ? 90 : 30;

  // 1️⃣ 기존 동일 기간/매장 집계 삭제
  const deleteQuery = `
    ALTER TABLE summary_stats_by_period
    DELETE WHERE period_type = '${periodType}'
      AND period_start >= today() - INTERVAL ${intervalDays} DAY
  `;
  await clickhouse.exec({ query: deleteQuery });

  // 2️⃣ 새로운 집계 삽입
  const insertQuery = `
    INSERT INTO summary_stats_by_period
    SELECT
      '${periodType}' AS period_type,
      ${dateFunc}(ordered_at) AS period_start,
      store_id,
      SUM(total_price) AS total_sales,
      COUNT(*) AS total_orders,
      AVG(total_price) AS avg_order_value,
      COUNT(DISTINCT user_id) AS unique_visitors,
      now() AS created_at
    FROM orders
    WHERE ordered_at >= today() - INTERVAL ${intervalDays} DAY
    GROUP BY store_id, period_start
  `;

  await clickhouse.exec({ query: insertQuery });
  console.log(`[Worker] ${periodType} summary stats aggregated`);
}
