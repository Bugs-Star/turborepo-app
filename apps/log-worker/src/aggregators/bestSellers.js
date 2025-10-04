// src/aggregators/bestSellers.js
import clickhouse from "../clickhouse/clickhouseClient.js";

/**
 * best_selling_menu_items 사전 집계 (일/주/월/년 지원 및 최적화)
 * @param {'daily'|'weekly'|'monthly'|'yearly'} periodType
 * @param {number} topN - 상위 N개 메뉴만 집계
 */
export async function aggregateBestSellers(periodType = "monthly", topN = 5) {
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

  // 2️⃣ 새로운 집계 삽입 (INSERT만 실행)
  const insertQuery = `
    INSERT INTO best_selling_menu_items
    SELECT *
    FROM (
      SELECT
        '${periodType}' AS period_type,
        ${dateFunc}(ordered_at) AS period_start,
        store_id,
        menu_id,
        
        -- ✅ any() 대신 argMax()를 사용해 가장 최신 데이터의 이름/카테고리를 선택
        argMax(menu_name, ordered_at) AS menu_name,
        argMax(category, ordered_at) AS category,
        
        SUM(quantity) AS order_count,
        SUM(total_price) AS total_revenue,
        row_number() OVER (
          -- ✅ 반드시 주석을 해제하여 매장별, 기간별 순위를 계산해야 함
          PARTITION BY store_id, ${dateFunc}(ordered_at)
          ORDER BY order_count DESC, total_revenue DESC
        ) AS rank
      FROM orders
      WHERE ordered_at >= today() - INTERVAL ${intervalDays} DAY
      GROUP BY store_id, menu_id, period_start
    )
    WHERE rank <= ${topN}
  `;



  await clickhouse.exec({ query: insertQuery });
  console.log(`[Worker] ${periodType} best sellers aggregated (Top ${topN})`);
}

// // src/aggregators/bestSellers.js
// import clickhouse from "../clickhouse/clickhouseClient.js";

// /**
//  * best_selling_menu_items 사전 집계
//  * @param {'weekly'|'monthly'} periodType
//  * @param {number} topN - 상위 N개 메뉴만 집계
//  */
// export async function aggregateBestSellers(periodType = "monthly", topN = 5) {
//   const dateFunc =
//     periodType === "monthly" ? "toStartOfMonth" : "toStartOfWeek";
//   const intervalDays = periodType === "monthly" ? 90 : 30;

//   // 1️⃣ 기존 동일 기간/매장 데이터 삭제
//   const deleteQuery = `
//     ALTER TABLE best_selling_menu_items
//     DELETE WHERE period_type = '${periodType}'
//       AND period_start >= today() - INTERVAL ${intervalDays} DAY
//   `;
//   await clickhouse.exec({ query: deleteQuery });

//   // 2️⃣ 새로운 집계 삽입
//   const insertQuery = `
//     INSERT INTO best_selling_menu_items
//     SELECT *
//     FROM (
//       SELECT
//         '${periodType}' AS period_type,
//         ${dateFunc}(ordered_at) AS period_start,
//         store_id,
//         menu_id,
//         SUM(quantity) AS order_count,
//         SUM(total_price) AS total_revenue,
//         row_number() OVER (
//           PARTITION BY store_id, ${dateFunc}(ordered_at)
//           ORDER BY SUM(quantity) DESC
//         ) AS rank
//       FROM orders
//       WHERE ordered_at >= today() - INTERVAL ${intervalDays} DAY
//       GROUP BY store_id, menu_id, period_start
//     )
//     WHERE rank <= ${topN}
//   `;

//   await clickhouse.exec({ query: insertQuery });
//   console.log(`[Worker] ${periodType} best sellers aggregated (Top ${topN})`);
// }
