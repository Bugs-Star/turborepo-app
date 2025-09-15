import clickhouse from "../clickhouse/clickhouseClient.js";

/**
 * RAG 통합 테이블 (rag_unified_store_summary) 사전 집계
 * @param {'weekly'|'monthly'} periodType
 */
export async function aggregateRagUnifiedSummary(periodType = "monthly") {
  const intervalDays = periodType === "monthly" ? 90 : 30;

  // 1️⃣ 기존 동일 기간/매장 집계 삭제
  const deleteQuery = `
    ALTER TABLE rag_unified_store_summary
    DELETE WHERE period_type = '${periodType}'
      AND period_start >= today() - INTERVAL ${intervalDays} DAY
  `;
  await clickhouse.exec({ query: deleteQuery });

  // 2️⃣ 세 개의 사전 집계 테이블을 JOIN하여 새로운 집계 삽입
  const insertQuery = `
    INSERT INTO rag_unified_store_summary (
        period_type, period_start, store_id, total_sales, total_orders, avg_order_value, unique_visitors,
        top_1_menu_id, top_1_order_count, top_2_menu_id, top_2_order_count, top_3_menu_id, top_3_order_count,
        top_1_path, top_1_path_users, top_2_path, top_2_path_users
    )
    -- 1. Top 3 판매 메뉴를 가로로 펼치는 임시 테이블 생성
    WITH best_menus_pivot AS (
        SELECT
            period_type,
            period_start,
            store_id,
            groupArray(menu_id)[1] AS top_1_menu_id,
            groupArray(order_count)[1] AS top_1_order_count,
            groupArray(menu_id)[2] AS top_2_menu_id,
            groupArray(order_count)[2] AS top_2_order_count,
            groupArray(menu_id)[3] AS top_3_menu_id,
            groupArray(order_count)[3] AS top_3_order_count
        FROM (
            SELECT * FROM best_selling_menu_items
            WHERE period_type = '${periodType}' AND period_start >= today() - INTERVAL ${intervalDays} DAY
            ORDER BY period_type, period_start, store_id, rank
        )
        GROUP BY period_type, period_start, store_id
    ),
    -- 2. Top 2 사용자 경로를 가로로 펼치는 임시 테이블 생성
    golden_paths_pivot AS (
        SELECT
            period_type,
            period_start,
            store_id,
            groupArray(path)[1] AS top_1_path,
            groupArray(user_count)[1] AS top_1_path_users,
            groupArray(path)[2] AS top_2_path,
            groupArray(user_count)[2] AS top_2_path_users
        FROM (
            SELECT * FROM golden_path_stats
            WHERE period_type = '${periodType}' AND period_start >= today() - INTERVAL ${intervalDays} DAY
            ORDER BY period_type, period_start, store_id, user_count DESC
        )
        GROUP BY period_type, period_start, store_id
    )
    -- 3. 기본 통계 테이블을 기준으로 위에서 만든 임시 테이블들을 LEFT JOIN
    SELECT
        s.period_type,
        s.period_start,
        s.store_id,
        s.total_sales,
        s.total_orders,
        s.avg_order_value,
        s.unique_visitors,
        m.top_1_menu_id,
        m.top_1_order_count,
        m.top_2_menu_id,
        m.top_2_order_count,
        m.top_3_menu_id,
        m.top_3_order_count,
        p.top_1_path,
        p.top_1_path_users,
        p.top_2_path,
        p.top_2_path_users
    FROM summary_stats_by_period AS s
    LEFT JOIN best_menus_pivot AS m ON s.period_type = m.period_type AND s.period_start = m.period_start AND s.store_id = m.store_id
    LEFT JOIN golden_paths_pivot AS p ON s.period_type = p.period_type AND s.period_start = p.period_start AND s.store_id = p.store_id
    WHERE s.period_type = '${periodType}' AND s.period_start >= today() - INTERVAL ${intervalDays} DAY
  `;

  await clickhouse.exec({ query: insertQuery });
  console.log(`[Worker] ${periodType} RAG unified summary aggregated`);
}
