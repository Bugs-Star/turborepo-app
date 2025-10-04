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
        // promotion_id가 없다면 metadata에서 추출 시도 (예: targetId)
        // 가장 좋은 방법은 processor.js에서 promotion_id 컬럼을 채워주는 것입니다.
        // 여기서는 promotion_id가 채워져 있다고 가정합니다.
        promotion_id,
        user_id,
        duration_seconds,
        
        // promotionName이 없는 viewScreenDuration을 위해 screenName에서 일부 추출 (임시방편)
        // 가장 좋은 방법은 viewScreenDuration 이벤트 로그에 promotionName, promotionId를 포함시키는 것입니다.
        if(event_type = 'viewScreenDuration',
           splitByChar('/', screenName)[-1], -- 예: /promotion/abc -> abc
           toString(metadata.promotionName)
        ) AS promotion_name,

        // --- 핵심 수정 부분 ---
        // 집계를 위한 플래그(flag) 컬럼 생성
        event_type = 'viewScreenDuration' AS is_view,
        (event_type = 'clickInteraction' AND JSONExtractString(metadata, 'interactionType') = 'promotionCard') AS is_click

      FROM events
      WHERE
        event_time >= today() - INTERVAL ${intervalDays} DAY
        -- --- 핵심 수정 부분 ---
        -- 실제 데이터에 맞는 이벤트 유형으로 변경
        AND (
          event_type = 'viewScreenDuration'
          OR (event_type = 'clickInteraction' AND JSONExtractString(metadata, 'interactionType') = 'promotionCard')
        )
        AND promotion_id IS NOT NULL AND promotion_id != ''
        
        // viewScreenDuration에는 promotionName이 없으므로 이 조건을 완화하거나 수정해야 함
        // AND isNotNull(metadata.promotionName) -- 이 조건을 제거하거나 아래처럼 수정
        AND promotion_name IS NOT NULL AND promotion_name != ''
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
    WHERE promotion_id IS NOT NULL -- prepared_events 단계에서 NULL이 될 수 있으므로 한 번 더 필터링
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