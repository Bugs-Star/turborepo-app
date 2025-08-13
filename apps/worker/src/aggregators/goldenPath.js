// src/aggregators/goldenPathStats.js
import clickhouse from "../clickhouse/clickhouseClient.js";

/**
 * 매장별 골든패스 집계 (weekly / monthly)
 * @param {'weekly'|'monthly'} periodType
 */
export async function aggregateGoldenPath(periodType = "weekly") {
  const dateFunc =
    periodType === "monthly" ? "toStartOfMonth" : "toStartOfWeek";
  const intervalDays = periodType === "monthly" ? 90 : 30;

  // 1️⃣ 기존 데이터 삭제
  const deleteQuery = `
    ALTER TABLE golden_path_stats
    DELETE WHERE period_type = '${periodType}'
      AND period_start >= today() - INTERVAL ${intervalDays} DAY
  `;
  await clickhouse.exec({ query: deleteQuery });

  // 2️⃣ 집계 삽입
  const insertQuery = `
    INSERT INTO golden_path_stats
    SELECT
        '${periodType}' AS period_type,
        period_start,
        store_id,
        groupArray(path) AS path,
        COUNT(DISTINCT user_id) AS user_count,
        COUNT(*) AS total_sessions
    FROM (
        SELECT
            store_id,
            ${dateFunc}(event_time) AS period_start,
            JSONExtractString(toString(metadata), 'page') AS path,
            user_id,
            session_id
        FROM events
        WHERE event_time >= today() - INTERVAL ${intervalDays} DAY
    )
    GROUP BY store_id, period_start
  `;
  await clickhouse.exec({ query: insertQuery });
  console.log(`[Worker] ${periodType} golden path stats aggregated`);
}
