// src/aggregators/goldenPathStats.js
import clickhouse from "../clickhouse/clickhouseClient.js";

export async function aggregateGoldenPath(periodType = "weekly") {
  const dateFunc =
    periodType === "monthly" ? "toStartOfMonth" : "toStartOfWeek";
  const intervalDays = periodType === "monthly" ? 90 : 30;

  // ... (deleteQuery 부분은 동일)
  const deleteQuery = `
    ALTER TABLE golden_path_stats
    DELETE WHERE period_type = '${periodType}'
      AND period_start >= today() - INTERVAL ${intervalDays} DAY
  `;
  await clickhouse.exec({ query: deleteQuery });

  // 2️⃣ CTE를 사용하여 재구성된 집계 쿼리
  const insertQuery = `
    WITH
        -- 1단계: 각 세션의 화면 이동 경로를 배열로 생성
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
                ORDER BY session_id, event_time ASC
            )
            GROUP BY session_id, store_id
        ),
        -- 2단계: 경로별 사용자(세션) 수 집계
        path_counts AS (
            SELECT
                period_start,
                store_id,
                path,
                count(session_id) AS user_count
            FROM session_paths
            GROUP BY period_start, store_id, path
        ),
        -- 3단계: 기간별/매장별 전체 세션 수 집계
        period_totals AS (
            SELECT
                ${dateFunc}(event_time) AS period_start,
                store_id,
                count(DISTINCT session_id) AS total_sessions
            FROM events
            WHERE event_time >= today() - INTERVAL ${intervalDays} DAY
            GROUP BY period_start, store_id
        )
    -- 4단계: 위에서 계산된 결과들을 JOIN하여 최종 데이터 삽입
    INSERT INTO golden_path_stats
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
  console.log(`[Worker] ${periodType} golden path stats aggregated`);
}


// // src/aggregators/goldenPathStats.js
// import clickhouse from "../clickhouse/clickhouseClient.js";

// /**
//  * 매장별 골든패스 집계 (weekly / monthly)
//  * @param {'weekly'|'monthly'} periodType
//  */
// export async function aggregateGoldenPath(periodType = "weekly") {
//   const dateFunc =
//     periodType === "monthly" ? "toStartOfMonth" : "toStartOfWeek";
//   const intervalDays = periodType === "monthly" ? 90 : 30;

//   // 1️⃣ 기존 데이터 삭제
//   const deleteQuery = `
//     ALTER TABLE golden_path_stats
//     DELETE WHERE period_type = '${periodType}'
//       AND period_start >= today() - INTERVAL ${intervalDays} DAY
//   `;
//   await clickhouse.exec({ query: deleteQuery });

//   // 2️⃣ 집계 삽입
//   const insertQuery = `
//     INSERT INTO golden_path_stats
//     SELECT
//         '${periodType}' AS period_type,
//         period_start,
//         store_id,
//         groupArray(path) AS path,
//         COUNT(DISTINCT user_id) AS user_count,
//         COUNT(*) AS total_sessions
//     FROM (
//         SELECT
//             store_id,
//             ${dateFunc}(event_time) AS period_start,
//             JSONExtractString(toString(metadata), 'page') AS path,
//             user_id,
//             session_id
//         FROM events
//         WHERE event_time >= today() - INTERVAL ${intervalDays} DAY
//     )
//     GROUP BY store_id, period_start
//   `;
//   await clickhouse.exec({ query: insertQuery });
//   console.log(`[Worker] ${periodType} golden path stats aggregated`);
// }
