// src/aggregators/purchaseGoldenPathStats.js
import clickhouse from "../clickhouse/clickhouseClient.js";

/**
 * '구매로 이어진' 골든패스 집계 (일/주/월/년 지원 및 최적화)
 * @param {'daily'|'weekly'|'monthly'|'yearly'} periodType
 */
export async function aggregatePurchaseGoldenPath(periodType = "weekly") {
  let dateFunc;
  let intervalDays;

  // 1️⃣ periodType에 따라 함수와 기간을 동적으로 설정
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

  const targetTable = 'purchase_golden_path_stats';

  // 2️⃣ 비효율적인 DELETE 쿼리 제거
  // ReplacingMergeTree가 ORDER BY 키 (period_start, store_id, path) 기준으로 중복을 자동 처리합니다.

  // 3️⃣ 새로운 집계 삽입 (INSERT만 실행)
  const insertQuery = `
    INSERT INTO ${targetTable}
    WITH
        session_paths AS (
            SELECT
                session_id,
                store_id,
                ${dateFunc}(min(event_time)) AS period_start,
                groupArray(CAST(metadata.screenName, 'String')) AS path
            FROM (
                SELECT
                    session_id,
                    store_id,
                    event_time,
                    metadata
                FROM events
                WHERE event_type = 'viewScreen'
                  AND event_time >= today() - INTERVAL ${intervalDays} DAY
                  AND session_id IN (
                      SELECT DISTINCT session_id FROM orders WHERE status = 'paid' AND ordered_at >= today() - INTERVAL ${intervalDays} DAY
                  )
                ORDER BY session_id, event_time ASC
            )
            GROUP BY session_id, store_id
        ),
        path_counts AS (
            SELECT
                period_start,
                store_id,
                path,
                count(session_id) AS user_count
            FROM session_paths
            GROUP BY period_start, store_id, path
        ),
        period_totals AS (
            SELECT
                ${dateFunc}(event_time) AS period_start,
                store_id,
                count(DISTINCT session_id) AS total_sessions
            FROM events
            WHERE event_time >= today() - INTERVAL ${intervalDays} DAY
              AND session_id IN (
                  SELECT DISTINCT session_id FROM orders WHERE status = 'paid' AND ordered_at >= today() - INTERVAL ${intervalDays} DAY
              )
            GROUP BY period_start, store_id
        )
    SELECT
        '${periodType}' AS period_type,
        pc.period_start,
        pc.store_id,
        pc.path,
        pc.user_count,
        pt.total_sessions
    FROM path_counts AS pc
    LEFT JOIN period_totals AS pt ON pc.period_start = pt.period_start AND pc.store_id = pt.store_id
    ORDER BY user_count DESC
    LIMIT 100 BY pc.period_start, pc.store_id
  `;
  await clickhouse.exec({ query: insertQuery });
  console.log(`[Worker] ${periodType} PURCHASE golden path stats aggregated`);
}

// // src/aggregators/purchaseGoldenPathStats.js (수정된 버전)
// import clickhouse from "../clickhouse/clickhouseClient.js";

// /**
//  * '구매로 이어진' 골든패스 집계
//  * @param {'weekly'|'monthly'} periodType
//  */
// export async function aggregatePurchaseGoldenPath(periodType = "weekly") {
//   const dateFunc =
//     periodType === "monthly" ? "toStartOfMonth" : "toStartOfWeek";
//   const intervalDays = periodType === "monthly" ? 90 : 30;

//   // 이 쿼리는 'purchase_golden_path_stats'라는 별도의 테이블을 사용합니다.
//   // 미리 생성해두어야 합니다.
//   const targetTable = 'purchase_golden_path_stats';

//   const deleteQuery = `
//     ALTER TABLE ${targetTable}
//     DELETE WHERE period_type = '${periodType}'
//       AND period_start >= today() - INTERVAL ${intervalDays} DAY
//   `;
//   await clickhouse.exec({ query: deleteQuery });

//   const insertQuery = `
//     -- ★★★ 수정: INSERT INTO 구문을 WITH 절 앞으로 이동
//     INSERT INTO ${targetTable}
//     WITH
//         -- 1단계: 각 세션의 화면 이동 경로를 배열로 생성
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
//                       SELECT DISTINCT session_id FROM orders WHERE status = 'paid'
//                   )
//                 ORDER BY session_id, event_time ASC
//             )
//             GROUP BY session_id, store_id
//         ),
//         -- 2단계: 경로별 사용자(세션) 수 집계
//         path_counts AS (
//             SELECT
//                 period_start,
//                 store_id,
//                 path,
//                 count(session_id) AS user_count
//             FROM session_paths
//             GROUP BY period_start, store_id, path
//         ),
//         -- 3단계: 기간별/매장별 '구매' 세션 수 집계
//         period_totals AS (
//             SELECT
//                 ${dateFunc}(event_time) AS period_start,
//                 store_id,
//                 count(DISTINCT session_id) AS total_sessions
//             FROM events
//             WHERE event_time >= today() - INTERVAL ${intervalDays} DAY
//               AND session_id IN (
//                   SELECT DISTINCT session_id FROM orders WHERE status = 'paid'
//               )
//             GROUP BY period_start, store_id
//         )
//     -- 4단계: 위에서 계산된 결과들을 JOIN하여 최종 데이터 선택
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