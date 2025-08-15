// clickhouseClient.js

import { createClient } from "@clickhouse/client";
import { CLICKHOUSE_CONFIG } from "../config/config.js";

const clickhouse = createClient(CLICKHOUSE_CONFIG);

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
  const resultText = await resultSet.text();
  return JSON.parse(resultText);
}

// ClickHouse 인스턴스를 외부에서 직접 사용할 수 있도록 export
export default clickhouse;
