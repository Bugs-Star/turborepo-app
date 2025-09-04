// processor.js (Final Version based on your request)

import { insertEvents, insertOrders } from "./clickhouse/clickhouseClient.js";
import crypto from 'crypto';

/**
 * Date 객체를 ClickHouse가 이해하는 "YYYY-MM-DD HH:MI:SS" 형식으로 변환합니다.
 */
function formatDateForCH(date) {
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

  const eventsToInsert = [];
  const ordersToInsert = [];

  for (const message of messages) {
    try {
      const jsonString = message[1][1];
      const logData = JSON.parse(jsonString);

      // 1. 주문 생성 '시도' 이벤트인지 확인합니다.
      if (logData.eventName === 'clickInteraction' && logData.payload.interactionType === 'buttonCreateOrder') {
        const orderPayload = logData.payload;
        const newOrderId = crypto.randomUUID(); // 이 주문 시도에 대한 고유 ID 생성

        // 2. 로그에 포함된 products 배열을 순회하며 상세 주문 데이터를 만듭니다.
        if (orderPayload.products && Array.isArray(orderPayload.products)) {
          orderPayload.products.forEach(product => {
            ordersToInsert.push({
              order_id: newOrderId,
              user_id: logData.userId,
              session_id: logData.sessionId,
              store_id: orderPayload.store_id || null,
              menu_id: product.productCode, // products 배열의 상품 코드를 사용
              quantity: String(product.quantity), // 안정성을 위해 문자열로 변환
              price_per_item: String(product.unitPrice || product.price),
              total_price: String(orderPayload.totalAmount),
              status: 'paid', // 'paid'가 아닌 '주문 시작됨' 상태로 기록
              ordered_at: formatDateForCH(new Date(logData.eventTimestamp)),
              updated_at: formatDateForCH(new Date(logData.eventTimestamp))
            });
          });
        }
      }

      // 3. 모든 로그는 events 테이블에 기록합니다.
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
      console.error("[Processor] Failed to parse or process message:", message, err);
    }
  }

  try {
    if (eventsToInsert.length > 0) {
      await insertEvents(eventsToInsert);
    }
    if (ordersToInsert.length > 0) {
      await insertOrders(ordersToInsert);
    }
  } catch (err) {
    console.error("[Processor] Failed to insert data to ClickHouse:", err);
  }
}

// // processor.js (Final Version with interactionType logic)

// import { insertEvents, insertOrders } from "./clickhouse/clickhouseClient.js";
// import crypto from 'crypto';

// /**
//  * Date 객체를 ClickHouse가 이해하는 "YYYY-MM-DD HH:MI:SS" 형식으로 변환합니다.
//  * @param {Date} date
//  * @returns {string}
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

//       // --- 여기가 새로운 처리 로직 ---

//       // 1. 주문 생성 '시도' 이벤트인지 확인합니다.
//       if (logData.eventName === 'clickInteraction' && logData.payload.interactionType === 'buttonCreateOrder') {
//         const orderPayload = logData.payload;
        
//         // 2. orders 테이블에 'initiated' 상태로 기록할 데이터를 만듭니다.
//         ordersToInsert.push({
//           order_id: crypto.randomUUID(), // 주문 시도에 대한 임시 ID 생성
//           user_id: logData.userId,
//           session_id: logData.sessionId,
//           store_id: orderPayload.store_id || null,
//           menu_id: null, // 이 이벤트에는 개별 메뉴 정보가 없으므로 null 처리
//           quantity: Number(orderPayload.itemCount),
//           price_per_item: Number(orderPayload.totalAmount) / Number(orderPayload.itemCount),
//           total_price: Number(orderPayload.totalAmount),
//           status: 'paid', // 'paid'가 아닌 '주문 시작됨' 상태로 기록
//           ordered_at: formatDateForCH(new Date(logData.eventTimestamp)),
//           updated_at: formatDateForCH(new Date(logData.eventTimestamp))
//         });
//       }

//       // 3. 모든 로그는 events 테이블에 기록합니다.
//       // (주문 생성 시도 역시 중요한 사용자 행동 이벤트입니다.)
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

// // // processor.js (Final Corrected Version)

// // import { insertEvents, insertOrders } from "./clickhouse/clickhouseClient.js";
// // import crypto from 'crypto';

// // /**
// //  * Date 객체를 ClickHouse DateTime 형식 문자열로 변환합니다.
// //  * "YYYY-MM-DD HH:MI:SS" 형식
// //  * @param {Date} date
// //  * @returns {string}
// //  */
// // function formatDateForCH(date) {
// //   const pad = (n) => n.toString().padStart(2, "0");
// //   const yyyy = date.getFullYear();
// //   const mm = pad(date.getMonth() + 1);
// //   const dd = pad(date.getDate());
// //   const hh = pad(date.getHours());
// //   const mi = pad(date.getMinutes());
// //   const ss = pad(date.getSeconds());
// //   return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
// // }

// // export async function processMessages(messages) {
// //   if (!messages || messages.length === 0) return;

// //   const eventsToInsert = [];
// //   const ordersToInsert = [];

// //   for (const message of messages) {
// //     try {
// //       const jsonString = message[1][1];
// //       const logData = JSON.parse(jsonString);

// //       // 공통 데이터 객체 생성
// //       const commonEventData = {
// //         event_id: crypto.randomUUID(),
// //         user_id: logData.userId,
// //         session_id: logData.sessionId,
// //         event_type: logData.eventName,
// //         // **가장 중요한 수정: 날짜를 ClickHouse 친화적인 포맷으로 직접 변환**
// //         event_time: formatDateForCH(new Date(logData.eventTimestamp)),
// //         store_id: logData.payload.store_id || null,
// //         metadata: logData.payload
// //       };

// //       switch (logData.eventName) {
// //         case 'orderCompleted': {
// //           // 주문 처리 로직 ...
// //           // ordersToInsert.push(...)
// //           eventsToInsert.push(commonEventData);
// //           break;
// //         }
// //         default: {
// //           eventsToInsert.push(commonEventData);
// //           break;
// //         }
// //       }
// //     } catch (err) {
// //       console.error("[Processor] Failed to parse or process message:", message, err);
// //     }
// //   }

// //   try {
// //     if (eventsToInsert.length > 0) {
// //       // clickhouseClient는 객체 배열을 그대로 받습니다.
// //       await insertEvents(eventsToInsert);
// //     }
// //     if (ordersToInsert.length > 0) {
// //       await insertOrders(ordersToInsert);
// //     }
// //   } catch (err) {
// //     console.error("[Processor] Failed to insert data to ClickHouse:", err);
// //     // 🚨 중요: 여기에 ackMessages가 없어야 합니다!
// //   }
// // }
