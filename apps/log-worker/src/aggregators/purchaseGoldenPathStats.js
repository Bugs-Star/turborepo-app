import clickhouse from "../clickhouse/clickhouseClient.js";

/**
 * '구매로 이어진' 골든패스 집계 (구매 상품 목록 포함, 배열 타입 안전 처리)
 * @param {'daily'|'weekly'|'monthly'|'yearly'} periodType
 */
export async function aggregatePurchaseGoldenPath(periodType = "weekly") {
  let dateFunc;
  let intervalDays;

  switch (periodType) {
    case "daily":
      dateFunc = "toDate";
      intervalDays = 7;
      break;
    case "weekly":
      dateFunc = "toStartOfWeek";
      intervalDays = 30;
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

  const targetTable = "purchase_golden_path_stats";

  const insertQuery = `
    INSERT INTO ${targetTable}
    WITH
      -- 1️⃣ 세션별 구매 상품 목록 (Array(String) 강제)
      session_purchases AS (
        SELECT
          session_id,
          CAST(arrayCompact(groupArray(menu_name)) AS Array(String)) AS items
        FROM orders
        WHERE status = 'paid'
          AND isNotNull(menu_name)
          AND ordered_at >= today() - INTERVAL ${intervalDays} DAY
        GROUP BY session_id
      ),

      -- 2️⃣ 세션별 경로 + 구매상품 JOIN
      session_paths AS (
        SELECT
          e.session_id,
          e.store_id,
          ${dateFunc}(min(e.event_time)) AS period_start,
          groupArray(CAST(e.metadata.screenName AS String)) AS path,
          ifNull(
            CAST(arrayFlatten(groupArray(p.items)) AS Array(String)),
            CAST([] AS Array(String))
          ) AS purchased_items_for_session
        FROM events AS e
        LEFT JOIN session_purchases AS p ON e.session_id = p.session_id
        WHERE e.event_type = 'viewScreen'
          AND e.event_time >= today() - INTERVAL ${intervalDays} DAY
          AND e.session_id IN (SELECT session_id FROM session_purchases)
        GROUP BY e.session_id, e.store_id
      ),

      -- 3️⃣ 경로별 집계 (배열 null/중첩 안전 처리)
      path_counts AS (
        SELECT
          period_start,
          store_id,
          path,
          count(session_id) AS user_count,
          arrayDistinct(
            arrayFlatten(
              groupArray(ifNull(purchased_items_for_session, CAST([] AS Array(String))))
            )
          ) AS purchased_items
        FROM session_paths
        GROUP BY period_start, store_id, path
      ),

      -- 4️⃣ 기간별 전체 세션 수
      period_totals AS (
        SELECT
          ${dateFunc}(event_time) AS period_start,
          store_id,
          count(DISTINCT session_id) AS total_sessions
        FROM events
        WHERE event_type = 'viewScreen'
          AND event_time >= today() - INTERVAL ${intervalDays} DAY
          AND session_id IN (SELECT session_id FROM session_purchases)
        GROUP BY period_start, store_id
      )

    -- 5️⃣ 최종 INSERT
    SELECT
      '${periodType}' AS period_type,
      pc.period_start,
      pc.store_id,
      pc.path,
      pc.purchased_items,
      pc.user_count,
      pt.total_sessions
    FROM path_counts AS pc
    LEFT JOIN period_totals AS pt
      ON pc.period_start = pt.period_start AND pc.store_id = pt.store_id
    ORDER BY user_count DESC
    LIMIT 100 BY pc.period_start, pc.store_id
  `;

  await clickhouse.exec({ query: insertQuery });
  console.log(`[Worker] ${periodType} PURCHASE golden path stats aggregated`);
}








// // src/aggregators/purchaseGoldenPathStats.js
// import clickhouse from "../clickhouse/clickhouseClient.js";

// /**
//  * '구매로 이어진' 골든패스 집계 (일/주/월/년 지원 및 최적화)
//  * @param {'daily'|'weekly'|'monthly'|'yearly'} periodType
//  */
// export async function aggregatePurchaseGoldenPath(periodType = "weekly") {
//   let dateFunc;
//   let intervalDays;

//   // 1️⃣ periodType에 따라 함수와 기간을 동적으로 설정
//   switch (periodType) {
//     case "daily":
//       dateFunc = "toDate";
//       intervalDays = 7;
//       break;
//     case "weekly":
//       dateFunc = "toStartOfWeek";
//       intervalDays = 30;
//       break;
//     case "monthly":
//       dateFunc = "toStartOfMonth";
//       intervalDays = 90;
//       break;
//     case "yearly":
//       dateFunc = "toStartOfYear";
//       intervalDays = 730;
//       break;
//     default:
//       throw new Error(`Unsupported periodType: ${periodType}`);
//   }

//   const targetTable = 'purchase_golden_path_stats';

//   // 2️⃣ 비효율적인 DELETE 쿼리 제거
//   // ReplacingMergeTree가 ORDER BY 키 (period_start, store_id, path) 기준으로 중복을 자동 처리합니다.

//   // 3️⃣ 새로운 집계 삽입 (INSERT만 실행)
//   const insertQuery = `
//     INSERT INTO ${targetTable}
//     WITH
//         session_paths AS (
//             SELECT
//                 session_id,
//                 store_id,
//                 ${dateFunc}(min(event_time)) AS period_start,
//                 groupArray(CAST(metadata.screenName, 'String')) AS path
//             FROM (
//                 SELECT
//                     session_id,
//                     store_id,
//                     event_time,
//                     metadata
//                 FROM events
//                 WHERE event_type = 'viewScreen'
//                   AND event_time >= today() - INTERVAL ${intervalDays} DAY
//                   AND session_id IN (
//                       SELECT DISTINCT session_id FROM orders WHERE status = 'paid' AND ordered_at >= today() - INTERVAL ${intervalDays} DAY
//                   )
//                 ORDER BY session_id, event_time ASC
//             )
//             GROUP BY session_id, store_id
//         ),
//         path_counts AS (
//             SELECT
//                 period_start,
//                 store_id,
//                 path,
//                 count(session_id) AS user_count
//             FROM session_paths
//             GROUP BY period_start, store_id, path
//         ),
//         period_totals AS (
//             SELECT
//                 ${dateFunc}(event_time) AS period_start,
//                 store_id,
//                 count(DISTINCT session_id) AS total_sessions
//             FROM events
//             WHERE event_time >= today() - INTERVAL ${intervalDays} DAY
//               AND session_id IN (
//                   SELECT DISTINCT session_id FROM orders WHERE status = 'paid' AND ordered_at >= today() - INTERVAL ${intervalDays} DAY
//               )
//             GROUP BY period_start, store_id
//         )
//     SELECT
//         '${periodType}' AS period_type,
//         pc.period_start,
//         pc.store_id,
//         pc.path,
//         pc.user_count,
//         pt.total_sessions
//     FROM path_counts AS pc
//     LEFT JOIN period_totals AS pt ON pc.period_start = pt.period_start AND pc.store_id = pt.store_id
//     ORDER BY user_count DESC
//     LIMIT 100 BY pc.period_start, pc.store_id
//   `;
//   await clickhouse.exec({ query: insertQuery });
//   console.log(`[Worker] ${periodType} PURCHASE golden path stats aggregated`);
// }
