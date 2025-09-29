import { getClickHouseClient } from "../clients/clickhouseClient.js";

async function inspectTables() {
  console.log("[Inspect] ClickHouse 테이블의 실제 데이터를 확인합니다...");
  const clickhouse = getClickHouseClient();
  try {
    // 1. orders 테이블의 최근 데이터 5개를 가져와서 구조를 확인합니다.
    console.log("\n--- [1] 최근 주문(orders) 데이터 샘플 (상위 5개) ---");
    const sampleQuery = `SELECT * FROM orders ORDER BY ordered_at DESC LIMIT 5`;
    const sampleResult = await clickhouse.query({ query: sampleQuery });
    const sampleData = await sampleResult.json();
    console.dir(sampleData.data, { depth: null });
    if (sampleData.data.length === 0) {
        console.warn("⚠️ 경고: 'orders' 테이블에 최근 데이터가 없습니다.");
    }

    // 2. 새로운 추천 로직용 쿼리가 결과를 반환하는지 확인합니다.
    console.log("\n--- [2] 새로운 추천 로직용 쿼리 실행 결과 (orders 테이블 기반) ---");
    const logicQuery = `
      SELECT
        user_id,
        menu_id AS item_id,
        'purchase' AS event_type
      FROM orders
      WHERE ordered_at >= now() - INTERVAL 7 DAY
      LIMIT 5
    `;
    const logicResult = await clickhouse.query({ query: logicQuery });
    const logicData = await logicResult.json();
    
    if (logicData.data.length > 0) {
      console.log("✅ 쿼리가 정상적으로 데이터를 반환합니다:");
      console.dir(logicData.data, { depth: null });
    } else {
      console.error("❌ 쿼리가 'orders' 테이블에서 데이터를 반환하지 못했습니다. 최근 7일 내의 주문 데이터가 있는지 확인해주세요.");
    }

  } catch (error) {
    console.error("❌ 데이터 확인 중 오류가 발생했습니다:", error);
  }
}

inspectTables();
