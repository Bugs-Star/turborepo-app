// processor.js (Final Integrated Version)

import { insertEvents, insertOrders } from "./clickhouse/clickhouseClient.js";
import { getRedisClient } from "./redis/redisClient.js"; // redisClient 임포트 추가
import crypto from 'crypto';

const DEBOUNCE_SECONDS = 60; // 60초 쿨다운 설정

/**
 * Date 객체를 ClickHouse가 이해하는 "YYYY-MM-DD HH:MI:SS" 형식으로 변환합니다.
 */
function formatDateForCH(date) {
  // ... (기존과 동일)
  const pad = (n) => n.toString().padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

export async function processMessages(messages) {
  if (!messages || messages.length === 0) return;

  const redis = getRedisClient(); // Redis 클라이언트 인스턴스 가져오기
  const eventsToInsert = [];
  const ordersToInsert = [];

  // --- 1. 모든 메시지를 일단 파싱하여 각 배열에 분류 ---
  for (const message of messages) {
    try {
      const jsonString = message[1][1];
      const logData = JSON.parse(jsonString);

      // 'buttonCreateOrder' 이벤트 처리 (기존 로직 유지)
      if (logData.eventName === 'clickInteraction' && logData.payload.interactionType === 'buttonCreateOrder') {
        const orderPayload = logData.payload;
        const newOrderId = crypto.randomUUID();

        if (orderPayload.products && Array.isArray(orderPayload.products)) {
          orderPayload.products.forEach(product => {
            ordersToInsert.push({
              order_id: newOrderId,
              user_id: logData.userId,
              session_id: logData.sessionId,
              store_id: orderPayload.store_id || null,
              menu_id: product.productCode,
              quantity: String(product.quantity),
              price_per_item: String(product.unitPrice || product.price),
              total_price: String(product.quantity * parseInt(String(product.unitPrice || product.price))),
              status: 'paid',
              ordered_at: formatDateForCH(new Date(logData.eventTimestamp)),
              updated_at: formatDateForCH(new Date(logData.eventTimestamp))
            });
          });
        }
      }

      // 모든 로그는 일단 eventsToInsert 배열에 추가
      eventsToInsert.push({
        event_id: crypto.randomUUID(),
        user_id: logData.userId,
        session_id: logData.sessionId,
        event_type: logData.eventName,
        event_time: formatDateForCH(new Date(logData.eventTimestamp)),
        store_id: logData.payload.store_id || null,
        metadata: logData.payload
      });

    } catch (err) {
      console.error("[Processor] Failed to parse message:", message, err);
    }
  }

  // --- 2. 에러 로그 디바운싱 로직 추가 (핵심) ---
  const finalEventsToInsert = [];
  const debounceKeysToSet = [];

  // 디바운스 확인이 필요한 'error_page' 이벤트들의 키를 미리 생성
  const errorEventChecks = eventsToInsert
    .map((event, index) => {
      if (event.event_type === "viewScreen" && event.metadata?.screenName === "error_page") {
        return {
          key: `error_log_debounce:${event.session_id}:${event.metadata.previousScreenName}`,
          index: index,
        };
      }
      return null;
    })
    .filter(Boolean);

  // Redis에서 중복 여부를 한 번에 확인
  let debouncedIndexes = new Set();
  if (errorEventChecks.length > 0) {
    const keys = errorEventChecks.map((item) => item.key);
    const results = await redis.mget(keys);
    results.forEach((result, i) => {
      if (result) { // 키가 존재하면 (중복이면)
        debouncedIndexes.add(errorEventChecks[i].index);
      }
    });
  }

  // 중복이 아닌 이벤트만 최종 삽입 목록(finalEventsToInsert)에 추가
  eventsToInsert.forEach((event, index) => {
    if (!debouncedIndexes.has(index)) {
      finalEventsToInsert.push(event);
      // 이 이벤트가 디바운스 대상이었다면, 나중에 잠금을 설정하기 위해 키를 저장
      const check = errorEventChecks.find(item => item.index === index);
      if (check) {
        debounceKeysToSet.push(check.key);
      }
    }
  });

  // --- 3. 필터링된 최종 데이터를 ClickHouse에 삽입 ---
  try {
    if (finalEventsToInsert.length > 0) {
      await insertEvents(finalEventsToInsert);
    }
    if (ordersToInsert.length > 0) {
      await insertOrders(ordersToInsert);
    }
  } catch (err) {
    console.error("[Processor] Failed to insert data to ClickHouse:", err);
    throw err; // 삽입 실패 시 재처리를 위해 에러를 던져 ack를 막음
  }

  // --- 4. 새로 처리된 에러 로그에 대한 잠금 설정 ---
  if (debounceKeysToSet.length > 0) {
    const pipeline = redis.pipeline();
    debounceKeysToSet.forEach(key => {
      pipeline.setex(key, DEBOUNCE_SECONDS, "1");
    });
    await pipeline.exec();
  }
}

// // processor.js (Final Version based on your request)

// import { insertEvents, insertOrders } from "./clickhouse/clickhouseClient.js";
// import crypto from 'crypto';

// /**
//  * Date 객체를 ClickHouse가 이해하는 "YYYY-MM-DD HH:MI:SS" 형식으로 변환합니다.
//  */
// function formatDateForCH(date) {
//   const pad = (n) => n.toString().padStart(2, "0");
//   const yyyy = date.getFullYear();
//   const mm = pad(date.getMonth() + 1);
//   const dd = pad(date.getDate());
//   const hh = pad(date.getHours());
//   const mi = pad(date.getMinutes());
//   const ss = pad(date.getSeconds());
//   return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
// }

// export async function processMessages(messages) {
//   if (!messages || messages.length === 0) return;

//   const eventsToInsert = [];
//   const ordersToInsert = [];

//   for (const message of messages) {
//     try {
//       const jsonString = message[1][1];
//       const logData = JSON.parse(jsonString);

//       // 1. 주문 생성 '시도' 이벤트인지 확인합니다.
//       if (logData.eventName === 'clickInteraction' && logData.payload.interactionType === 'buttonCreateOrder') {
//         const orderPayload = logData.payload;
//         const newOrderId = crypto.randomUUID(); // 이 주문 시도에 대한 고유 ID 생성

//         // 2. 로그에 포함된 products 배열을 순회하며 상세 주문 데이터를 만듭니다.
//         if (orderPayload.products && Array.isArray(orderPayload.products)) {
//           orderPayload.products.forEach(product => {
//             ordersToInsert.push({
//               order_id: newOrderId,
//               user_id: logData.userId,
//               session_id: logData.sessionId,
//               store_id: orderPayload.store_id || null,
//               menu_id: product.productCode, // products 배열의 상품 코드를 사용
//               quantity: String(product.quantity), // 안정성을 위해 문자열로 변환
//               price_per_item: String(product.unitPrice || product.price),
//               total_price: String(orderPayload.totalAmount),
//               status: 'paid', // 'paid'가 아닌 '주문 시작됨' 상태로 기록
//               ordered_at: formatDateForCH(new Date(logData.eventTimestamp)),
//               updated_at: formatDateForCH(new Date(logData.eventTimestamp))
//             });
//           });
//         }
//       }

//       // 3. 모든 로그는 events 테이블에 기록합니다.
//       eventsToInsert.push({
//         event_id: crypto.randomUUID(),
//         user_id: logData.userId,
//         session_id: logData.sessionId,
//         event_type: logData.eventName,
//         event_time: formatDateForCH(new Date(logData.eventTimestamp)),
//         store_id: logData.payload.store_id || null,
//         metadata: logData.payload
//       });

//     } catch (err) {
//       console.error("[Processor] Failed to parse or process message:", message, err);
//     }
//   }

//   try {
//     if (eventsToInsert.length > 0) {
//       await insertEvents(eventsToInsert);
//     }
//     if (ordersToInsert.length > 0) {
//       await insertOrders(ordersToInsert);
//     }
//   } catch (err) {
//     console.error("[Processor] Failed to insert data to ClickHouse:", err);
//   }
// }
