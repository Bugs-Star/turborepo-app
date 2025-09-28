// processor.js (Final Integrated Version with Promotion Tracking)

import { insertEvents, insertOrders } from "./clickhouse/clickhouseClient.js";
import { getRedisClient } from "./redis/redisClient.js";
import crypto from 'crypto';

const DEBOUNCE_SECONDS = 60;

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

  const redis = getRedisClient();
  const eventsToInsert = [];
  const ordersToInsert = [];

  // --- 1. 모든 메시지를 파싱하여 각 배열에 분류 ---
  for (const message of messages) {
    try {
      const jsonString = message[1][1];
      const logData = JSON.parse(jsonString);

      // 'buttonCreateOrder' 이벤트 처리
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
              menu_name: product.productName,
              category: product.category,
              quantity: String(product.quantity),
              price_per_item: String(product.unitPrice || product.price),
              total_price: String(product.quantity * parseInt(String(product.unitPrice || product.price))),
              status: 'paid',
              ordered_at: formatDateForCH(new Date(logData.eventTimestamp)),
              updated_at: formatDateForCH(new Date(logData.eventTimestamp)),
              promotion_id: orderPayload.promotionId || null // <<-- 변경된 부분: 주문 시점의 프로모션 ID 추가
            });
          });
        }
      }

      // 모든 로그는 eventsToInsert 배열에 추가
      eventsToInsert.push({
        event_id: crypto.randomUUID(),
        user_id: logData.userId,
        session_id: logData.sessionId,
        event_type: logData.eventName,
        event_time: formatDateForCH(new Date(logData.eventTimestamp)),
        store_id: logData.payload.store_id || null,
        metadata: logData.payload,
        promotion_id: logData.payload.promotionId || null,     // <<-- 변경된 부분: 프로모션 ID 추가
        duration_seconds: logData.payload.durationSeconds || 0 // <<-- 변경된 부분: 시청 시간(초) 추가
      });

    } catch (err) {
      console.error("[Processor] Failed to parse message:", message, err);
    }
  }

  // --- 2. 에러 로그 디바운싱 로직 (기존과 동일) ---
  const finalEventsToInsert = [];
  const debounceKeysToSet = [];

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

  let debouncedIndexes = new Set();
  if (errorEventChecks.length > 0) {
    const keys = errorEventChecks.map((item) => item.key);
    const results = await redis.mget(keys);
    results.forEach((result, i) => {
      if (result) {
        debouncedIndexes.add(errorEventChecks[i].index);
      }
    });
  }

  eventsToInsert.forEach((event, index) => {
    if (!debouncedIndexes.has(index)) {
      finalEventsToInsert.push(event);
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
    throw err;
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