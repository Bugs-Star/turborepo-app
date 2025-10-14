import { createClient } from "@clickhouse/client";
import { CLICKHOUSE_CONFIG } from "../config/config.js";

const clickhouse = createClient(CLICKHOUSE_CONFIG);

// --- 추가된 부분 시작 ---

/**
 * 애플리케이션에 필요한 모든 ClickHouse 테이블을 정의합니다.
 * 각 객체는 테이블 이름과 생성 쿼리를 포함합니다.
 */
const tableSchemas = [
  {
    tableName: "promotion_summary_by_period",
    query: `
      CREATE TABLE IF NOT EXISTS promotion_summary_by_period (
      -- 집계 주기 (daily, weekly, monthly, yearly)
      period_type String,

      -- 집계 시작일 (해당 주의 월요일, 해당 월의 1일 등)
      period_start Date,

      -- 프로모션 ID
      promotion_id String,

      -- 프로모션 이름
      promotion_name String,

      -- 총 조회수
      total_views UInt64,

      -- 총 시청 시간 (초)
      total_view_duration_seconds UInt64,

      -- 순 방문자 수 (조회 기준)
      unique_viewers UInt64,

      -- 총 클릭 수
      total_clicks UInt64,

      -- 순 클릭 유저 수
      unique_clickers UInt64,
      
      -- (추가) 총 주문 수
      total_orders UInt64,

      -- (추가) 총 매출액
      total_revenue UInt64,

      -- (추가) 전환율
      conversion_rate Float64,

      -- 집계된 시간 (ReplacingMergeTree 버전 관리를 위함)
      updated_at DateTime

      ) ENGINE = ReplacingMergeTree(updated_at)
      PARTITION BY toYYYYMM(period_start)
      ORDER BY (period_type, period_start, promotion_id);
      `,
  },
  {
    tableName: "events",
    query: `
      CREATE TABLE IF NOT EXISTS events (
      event_id UUID,
      user_id String,
      session_id String,
      event_type String,
      event_time DateTime,
      store_id String,
      metadata JSON,

      -- 광고 분석을 위해 추가된 컬럼
      promotion_id String,
      duration_seconds UInt32

      ) ENGINE = MergeTree()
      PARTITION BY toYYYYMM(event_time)
      ORDER BY (user_id, session_id, event_time);
    `,
  },
  {
    tableName: "orders",
    query: `
      CREATE TABLE IF NOT EXISTS orders (
    order_id UUID,
    user_id String,
    session_id String,
    store_id String,
    menu_id String,
    menu_name String,
    category String,
    quantity UInt8,
    price_per_item UInt32,
    total_price UInt32,
    status Enum8('paid' = 1, 'canceled' = 2, 'refunded' = 3, 'initiated' = 4),
    ordered_at DateTime,
    updated_at DateTime,

    -- 광고 성과 분석을 위해 추가된 컬럼
    promotion_id String

    ) ENGINE = MergeTree()
    ORDER BY (store_id, ordered_at);
    `,
  },

  // --- 사전 집계 테이블 (ReplacingMergeTree로 모두 변경) ---
  {
    tableName: "sales_summary_by_period",
    query: `
      CREATE TABLE IF NOT EXISTS sales_summary_by_period (
        period_type String, period_start Date, store_id String,
        total_sales Float64, total_orders UInt32, avg_order_value Float64,
        unique_customers UInt32, total_customers UInt32, created_at DateTime
      ) ENGINE = ReplacingMergeTree() -- 수정: ReplacingMergeTree로 변경
      PARTITION BY period_type
      ORDER BY (period_start, store_id); -- 이 키가 고유 식별자이므로 유지
    `,
  },
  {
    tableName: "visitor_summary_by_period",
    query: `
      CREATE TABLE IF NOT EXISTS visitor_summary_by_period (
        -- Dimensions
        period_type Enum8('daily' = 1, 'weekly' = 2, 'monthly' = 3, 'yearly' = 4),
        period_start Date,
        store_id String,

        -- Metrics
        total_unique_visitors UInt64,
        engaged_visitors UInt64,
        page_views UInt64,
        total_sessions UInt64,
        bounced_sessions UInt64,
        bounce_rate Float32,
        avg_session_duration_seconds Float64,

        -- Meta
        updated_at DateTime
      ) ENGINE = ReplacingMergeTree(updated_at)
      PARTITION BY toYYYYMM(period_start)
      ORDER BY (period_type, store_id, period_start);
    `,
  },
  {
    tableName: "kpi_summary_by_period",
    query: `
      CREATE TABLE IF NOT EXISTS kpi_summary_by_period (
        -- Dimensions (데이터를 구분하는 기준)
        period_type Enum8('daily' = 1, 'weekly' = 2, 'monthly' = 3, 'yearly' = 4),
        period_start Date,
        store_id String,

        -- Visitor Metrics (방문자 관련 지표)
        total_unique_visitors UInt64,
        engaged_visitors UInt64,
        bounce_rate Float32,

        -- Sales Metrics (매출 관련 지표)
        unique_customers UInt64,
        total_sales UInt64,
        total_orders UInt64,

        -- Combined KPIs (통합 핵심 성과 지표)
        conversion_rate Float32,
        revenue_per_visitor Float64,

        -- Meta (데이터 관리용)
        updated_at DateTime
      ) ENGINE = ReplacingMergeTree(updated_at)
      PARTITION BY toYYYYMM(period_start)
      ORDER BY (period_type, store_id, period_start);
    `,
  },
  {
    tableName: "best_selling_menu_items",
    query: `
      CREATE TABLE IF NOT EXISTS best_selling_menu_items (
        period_type String, period_start Date, store_id String, menu_id String, menu_name String,
        category String, order_count UInt32, total_revenue Float64, rank UInt8
      ) ENGINE = ReplacingMergeTree() -- 수정: ReplacingMergeTree로 변경
      PARTITION BY period_type
      -- 수정: rank 대신 menu_id를 키에 추가하여 고유 메뉴를 식별하도록 변경
      ORDER BY (period_start, store_id, menu_id);
    `,
  },
  {
    tableName: "golden_path_stats",
    query: `
      CREATE TABLE IF NOT EXISTS golden_path_stats (
        period_type String, period_start Date, store_id String, path Array(String),
        user_count UInt32, total_sessions UInt32
      ) ENGINE = ReplacingMergeTree() -- 수정: ReplacingMergeTree로 변경
      PARTITION BY period_type
      -- 수정: user_count 대신 path를 키에 추가하여 고유 경로를 식별하도록 변경
      ORDER BY (period_start, store_id, path);
    `,
  },
  {
    tableName: "purchase_golden_path_stats",
    query: `
      CREATE TABLE IF NOT EXISTS purchase_golden_path_stats (
        period_type String, 
        period_start Date, 
        store_id String, 
        path Array(String),
        purchased_items Array(String), 
        user_count UInt32, 
        total_sessions UInt32
      ) ENGINE = ReplacingMergeTree() -- 수정: ReplacingMergeTree로 변경
      PARTITION BY period_type
      -- 수정: user_count 대신 path를 키에 추가하여 고유 경로를 식별하도록 변경
      ORDER BY (period_start, store_id, path);
    `,
  },
  {
    tableName: "rag_unified_store_summary",
    query: `
      CREATE TABLE IF NOT EXISTS rag_unified_store_summary (
        period_type String, period_start Date, store_id String, total_sales Float64,
        total_orders UInt32, avg_order_value Float64, unique_customers UInt32,
        top_1_menu_id String, top_1_order_count UInt32, top_2_menu_id String,
        top_2_order_count UInt32, top_3_menu_id String, top_3_order_count UInt32,
        top_1_path Array(String), top_1_path_users UInt32, top_2_path Array(String),
        top_2_path_users UInt32, created_at DateTime DEFAULT now()
      ) ENGINE = ReplacingMergeTree() -- 수정: ReplacingMergeTree로 변경
      PARTITION BY period_type
      ORDER BY (period_start, store_id); -- 이 키가 고유 식별자이므로 유지
    `,
  },
];

/**
 * ClickHouse 데이터베이스를 초기화합니다.
 * 정의된 모든 테이블이 없는 경우 자동으로 생성합니다.
 */
export async function initializeDatabase() {
  console.log("[ClickHouse] Initializing database...");
  try {
    for (const schema of tableSchemas) {
      await clickhouse.command({
        query: schema.query,
        // ClickHouse Cloud에서 query_id를 요구하는 경우가 있으므로 추가
        query_id: `create_${schema.tableName}`,
      });
      console.log(`[ClickHouse] Table "${schema.tableName}" is ready.`);
    }
    console.log("[ClickHouse] Database initialization complete.");
  } catch (error) {
    console.error("[ClickHouse] Failed to initialize database:", error);
    process.exit(1); // 초기화 실패 시 프로세스 종료
  }
}

// --- 추가된 부분 끝 ---


/**
 * 이벤트 데이터를 ClickHouse "events" 테이블에 삽입합니다.
 * @param {Array<Object>} events - 이벤트 객체 배열
 */
export async function insertEvents(events) {
  if (!Array.isArray(events) || events.length === 0) return;

  await clickhouse.insert({
    table: "events",
    values: events,
    format: "JSONEachRow",
  });

  console.log(`[ClickHouse] Inserted ${events.length} events`);
}

/**
 * 주문 데이터를 ClickHouse "orders" 테이블에 삽입합니다.
 * @param {Array<Object>} orders - 주문 객체 배열
 */
export async function insertOrders(orders) {
  if (!Array.isArray(orders) || orders.length === 0) return;

  await clickhouse.insert({
    table: "orders",
    values: orders,
    format: "JSONEachRow",
  });

  console.log(`[ClickHouse] Inserted ${orders.length} orders`);
}

/**
 * ClickHouse에 쿼리를 보내고 결과를 배열로 반환합니다.
 * @param {string} query - 실행할 SQL 쿼리
 * @returns {Promise<Array<Object>>} 쿼리 결과 배열
 */
export async function queryClickHouse(query) {
  const resultSet = await clickhouse.query({ query, format: "JSON" });
  // .json() 메서드를 사용하는 것이 더 안정적입니다.
  return resultSet.json();
}

// ClickHouse 인스턴스를 외부에서 직접 사용할 수 있도록 export
export default clickhouse;

// // clickhouseClient.js

// import { createClient } from "@clickhouse/client";
// import { CLICKHOUSE_CONFIG } from "../config/config.js";

// const clickhouse = createClient(CLICKHOUSE_CONFIG);

// /**
//  * 이벤트 데이터를 ClickHouse "events" 테이블에 삽입합니다.
//  * @param {Array<Object>} events - 이벤트 객체 배열
//  */
// export async function insertEvents(events) {
//   if (!Array.isArray(events) || events.length === 0) return;

//   await clickhouse.insert({
//     table: "events",
//     values: events,
//     format: "JSONEachRow",
//   });

//   console.log(`[ClickHouse] Inserted ${events.length} events`);
// }

// /**
//  * 주문 데이터를 ClickHouse "orders" 테이블에 삽입합니다.
//  * @param {Array<Object>} orders - 주문 객체 배열
//  */
// export async function insertOrders(orders) {
//   if (!Array.isArray(orders) || orders.length === 0) return;

//   await clickhouse.insert({
//     table: "orders",
//     values: orders,
//     format: "JSONEachRow",
//   });

//   console.log(`[ClickHouse] Inserted ${orders.length} orders`);
// }

// /**
//  * ClickHouse에 쿼리를 보내고 결과를 배열로 반환합니다.
//  * @param {string} query - 실행할 SQL 쿼리
//  * @returns {Promise<Array<Object>>} 쿼리 결과 배열
//  */
// export async function queryClickHouse(query) {
//   const resultSet = await clickhouse.query({ query, format: "JSON" });
//   const resultText = await resultSet.text();
//   return JSON.parse(resultText);
// }

// // ClickHouse 인스턴스를 외부에서 직접 사용할 수 있도록 export
// export default clickhouse;
