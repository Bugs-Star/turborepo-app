// processor.js

// ClickHouse에 데이터를 저장하는 함수들을 import 합니다.
// insertEvents: 이벤트 데이터를 ClickHouse의 events 테이블에 삽입
// insertOrders: 주문 데이터를 ClickHouse의 orders 테이블에 삽입
import { insertEvents, insertOrders } from "./clickhouse/clickhouseClient.js";

/**
 * Redis Streams 메시지 필드 배열 → 객체 변환 함수
 *
 * Redis Streams는 메시지를 key-value 배열 형태로 제공합니다:
 * 예: ["user_id", "abc123", "event_type", "visit"]
 *
 * 이 함수는 해당 배열을 일반 객체로 변환합니다:
 * 결과: { user_id: "abc123", event_type: "visit" }
 *
 * @param {Array<string>} fields - Redis 메시지 필드 배열
 * @returns {Object} - key-value 쌍의 객체
 */
function fieldsArrayToObject(fields) {
  const obj = {};

  // 배열을 2칸씩 증가하며 key-value로 나눠서 객체에 할당
  for (let i = 0; i < fields.length; i += 2) {
    obj[fields[i]] = fields[i + 1];
  }

  return obj;
}

/**
 * 메시지 파싱 및 ClickHouse 적재 함수
 *
 * Redis에서 읽어온 메시지를 이벤트/주문으로 분류하여
 * 각각 events / orders 테이블에 저장합니다.
 *
 * 메시지 형식: [ [id1, [key1, val1, key2, val2, ...]], [id2, [...]], ... ]
 *
 * @param {Array} messages - Redis에서 읽은 메시지 배열
 */
export async function processMessages(messages) {
  // 메시지가 없으면 아무 작업도 하지 않고 종료
  if (!messages.length) return;

  // 이벤트와 주문 데이터를 각각 따로 저장할 배열
  const events = [];
  const orders = [];

  // 메시지 반복 처리
  for (const [id, fields] of messages) {
    // Redis 필드 배열 → 객체로 변환
    const data = fieldsArrayToObject(fields);

    /**
     * 메시지가 이벤트인지 주문인지 판단
     * 기준:
     *  - event_id가 있으면 이벤트
     *  - order_id가 있으면 주문
     */

    if (data.event_id) {
      // metadata 필드는 JSON 문자열일 수 있으므로 파싱 시도
      try {
        data.metadata = JSON.parse(data.metadata || "{}");
      } catch {
        // 파싱 실패 시 빈 객체로 대체
        data.metadata = {};
      }

      // ClickHouse events 테이블에 넣을 형식으로 정제
      events.push({
        event_id: data.event_id,
        user_id: data.user_id,
        session_id: data.session_id,
        event_type: data.event_type,
        event_time: data.event_time, // ISO 문자열 (ex: 2025-08-08T23:10:00Z)
        store_id: data.store_id,
        metadata: data.metadata, // 다시 문자열로 변환하여 저장
        // metadata: JSON.stringify(data.metadata), // 다시 문자열로 변환하여 저장
      });
    } else if (data.order_id) {
      // 주문 데이터는 숫자 필드가 섞여 있으므로 타입 캐스팅 필요
      orders.push({
        order_id: data.order_id,
        user_id: data.user_id,
        session_id: data.session_id,
        store_id: data.store_id,
        menu_id: data.menu_id,
        quantity: Number(data.quantity), // 문자열 → 숫자
        price_per_item: Number(data.price_per_item),
        total_price: Number(data.total_price),
        status: data.status,
        ordered_at: data.ordered_at, // ISO 문자열
        updated_at: data.updated_at,
      });
    } else {
      // event_id도 order_id도 없는 메시지는 알 수 없는 형식으로 처리
      console.warn("[Processor] Unknown message type", data);
    }
  }

  // 정제된 데이터를 ClickHouse에 저장
  // insertEvents / insertOrders는 내부적으로 batch insert를 수행함
  await insertEvents(events); // events.length가 0이어도 안전하게 동작하도록 구현되어야 함
  await insertOrders(orders);
}
