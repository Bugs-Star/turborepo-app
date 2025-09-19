// src/aggregators/visitorSummary.js
import clickhouse from "../clickhouse/clickhouseClient.js";

/**
 * visitor_summary_by_period 사전 집계 (일/주/월/년 지원)
 * @param {'daily'|'weekly'|'monthly'|'yearly'} periodType
 */
export async function aggregateVisitorSummary(periodType = "monthly") {
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
    -- CTE를 사용하여 세션별로 1차 집계를 먼저 수행
    WITH sessions_summary AS (
      SELECT
          store_id,
          user_id,
          session_id,
          min(event_time) AS session_start_at,
          countIf(event_type = 'viewScreen') AS page_views_in_session,
          date_diff('second', min(event_time), max(event_time)) AS session_duration_seconds
      FROM events
      WHERE event_time >= today() - INTERVAL ${intervalDays} DAY -- 집계할 기간 필터링
      GROUP BY store_id, user_id, session_id
    )
    -- 최종적으로 기간/상점별로 2차 집계하여 삽입
    INSERT INTO visitor_summary_by_period
    SELECT
      '${periodType}' AS period_type,
      ${dateFunc}(session_start_at) AS period_start,
      store_id,

      count(DISTINCT user_id) AS total_unique_visitors,
      count(DISTINCT if(page_views_in_session > 1, user_id, NULL)) AS engaged_visitors,
      sum(page_views_in_session) AS page_views,
      count(DISTINCT session_id) AS total_sessions,
      countIf(page_views_in_session = 1) AS bounced_sessions,
      if(total_sessions > 0, round(bounced_sessions / total_sessions, 4), 0) AS bounce_rate,
      avg(session_duration_seconds) AS avg_session_duration_seconds,

      now() AS updated_at -- ReplacingMergeTree의 버전 관리용 컬럼
    FROM sessions_summary
    GROUP BY store_id, period_start
  `;

  await clickhouse.exec({ query: insertQuery });
  console.log(`[Worker] ${periodType} visitor summary stats aggregated (Optimized)`);
}