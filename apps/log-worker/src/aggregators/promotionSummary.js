// src/aggregators/promotionSummary.js
import clickhouse from "../clickhouse/clickhouseClient.js";

/**
 * promotion_summary_by_period 사전 집계 (CTE 구조로 안정성 강화)
 * @param {'daily'|'weekly'|'monthly'|'yearly'} periodType
 */
export async function aggregatePromotionSummary(periodType = "weekly") {
  let dateFunc;
  let intervalDays;

  switch (periodType) {
    case "daily":
      dateFunc = "toDate";
      intervalDays = 7;
      break;
    case "weekly":
      dateFunc = "toStartOfWeek";
      intervalDays = 35;
      break;
    case "monthly":
      dateFunc = "toStartOfMonth";
      intervalDays = 90;
      break;
    case "yearly":
      dateFunc = "toStartOfYear";
      intervalDays = 730;
      break;
    default:
      throw new Error(`Unsupported periodType: ${periodType}`);
  }

  // <<-- 수정한 부분: visitorSummary.js처럼 WITH 절(CTE)을 사용하는 구조로 변경
  const insertQuery = `
    WITH prepared_events AS (
      SELECT
        event_time,
        promotion_id,
        user_id,
        duration_seconds,
        // JSON 타입은 .(점)으로 직접 접근 후, 안전하게 String으로 변환
        toString(metadata.promotionName) AS promotion_name,
        // 집계를 위한 플래그(flag) 컬럼 생성
        event_type = 'viewScreenDuration' AS is_view,
        event_type = 'clickPromotion' AS is_click
      FROM events
      WHERE
        event_time >= today() - INTERVAL ${intervalDays} DAY
        AND event_type IN ('viewScreenDuration', 'clickPromotion')
        AND promotion_id IS NOT NULL AND promotion_id != ''
        // JSONHas 대신 isNotNull로 키 존재 여부 확인
        AND isNotNull(metadata.promotionName)
    )
    INSERT INTO promotion_summary_by_period
    SELECT
      '${periodType}' AS period_type,
      ${dateFunc}(event_time) AS period_start,
      promotion_id,
      any(promotion_name) AS promotion_name,
      
      countIf(is_view) AS total_views,
      sumIf(duration_seconds, is_view) AS total_view_duration_seconds,
      uniqExactIf(user_id, is_view) AS unique_viewers,
      
      countIf(is_click) AS total_clicks,
      uniqExactIf(user_id, is_click) AS unique_clickers,

      now() AS updated_at
    FROM prepared_events
    GROUP BY
      period_start,
      promotion_id
  `;

  try {
    await clickhouse.exec({ query: insertQuery });
    console.log(`[Worker] ${periodType} promotion summary aggregated.`);
  } catch (err) {
    console.error(`[Worker] Failed to aggregate ${periodType} promotion summary:`, err);
    throw err;
  }
}