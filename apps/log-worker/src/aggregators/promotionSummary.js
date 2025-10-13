// src/aggregators/promotionSummary.js (JSON 타입 오류 최종 수정본)
import clickhouse from "../clickhouse/clickhouseClient.js";

/**
 * promotion_summary_by_period 사전 집계 (JSON 타입 접근 오류 수정)
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

  const insertQuery = `
    WITH
      aggregated_events AS (
        SELECT
          ${dateFunc}(event_time) AS period_start,
          promotion_id,
          any(if(
            event_type = 'viewScreenDuration',
            -- [최종 수정] JSON 타입은 점(.)으로 직접 접근합니다.
            splitByChar('/', toString(metadata.screenName))[-1],
            toString(metadata.promotionName)
          )) AS promotion_name,
          countIf(event_type = 'viewScreenDuration') AS total_views,
          sumIf(duration_seconds, event_type = 'viewScreenDuration') AS total_view_duration_seconds,
          uniqExactIf(user_id, event_type = 'viewScreenDuration') AS unique_viewers,
          -- [최종 수정] JSON 타입은 점(.)으로 직접 접근합니다.
          countIf(event_type = 'clickInteraction' AND toString(metadata.interactionType) = 'promotionCard') AS total_clicks,
          uniqExactIf(user_id, event_type = 'clickInteraction' AND toString(metadata.interactionType) = 'promotionCard') AS unique_clickers
        FROM events
        WHERE
          event_time >= today() - INTERVAL ${intervalDays} DAY
          AND (
            event_type = 'viewScreenDuration' OR 
            -- [최종 수정] JSON 타입은 점(.)으로 직접 접근합니다.
            (event_type = 'clickInteraction' AND toString(metadata.interactionType) = 'promotionCard')
          )
          AND promotion_id IS NOT NULL AND promotion_id != ''
        GROUP BY period_start, promotion_id
      ),

      aggregated_orders AS (
        SELECT
          ${dateFunc}(ordered_at) AS period_start,
          promotion_id,
          count() AS total_orders,
          sum(total_price) AS total_revenue
        FROM orders
        WHERE
          ordered_at >= today() - INTERVAL ${intervalDays} DAY
          AND promotion_id IS NOT NULL AND promotion_id != ''
          AND status = 'paid'
        GROUP BY period_start, promotion_id
      )

    INSERT INTO promotion_summary_by_period
    SELECT
      '${periodType}' AS period_type,
      COALESCE(e.period_start, o.period_start) AS period_start,
      COALESCE(e.promotion_id, o.promotion_id) AS promotion_id,
      e.promotion_name,
      ifNull(e.total_views, 0) AS total_views,
      ifNull(e.total_view_duration_seconds, 0) AS total_view_duration_seconds,
      ifNull(e.unique_viewers, 0) AS unique_viewers,
      ifNull(e.total_clicks, 0) AS total_clicks,
      ifNull(e.unique_clickers, 0) AS unique_clickers,
      ifNull(o.total_orders, 0) AS total_orders,
      ifNull(o.total_revenue, 0) AS total_revenue,
      if(ifNull(e.total_clicks, 0) > 0, ifNull(o.total_orders, 0) / e.total_clicks, 0) AS conversion_rate,
      now() AS updated_at
    FROM aggregated_events AS e
    FULL JOIN aggregated_orders AS o ON e.period_start = o.period_start AND e.promotion_id = o.promotion_id
  `;

  try {
    await clickhouse.exec({ query: insertQuery });
    console.log(`[Worker] ${periodType} promotion summary aggregated.`);
  } catch (err) {
    console.error(`[Worker] Failed to aggregate ${periodType} promotion summary:`, err);
    throw err;
  }
}