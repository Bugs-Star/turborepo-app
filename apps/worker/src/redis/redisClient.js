// redisClient.js
import Redis from "ioredis";
import { REDIS_STREAM_KEY, REDIS_CONSUMER_GROUP } from "../config/config.js";

const redis = new Redis();

export async function ensureConsumerGroup() {
  try {
    await redis.xgroup(
      "CREATE",
      REDIS_STREAM_KEY,
      REDIS_CONSUMER_GROUP,
      "$",
      "MKSTREAM"
    );
    console.log("[Redis] Consumer group created");
  } catch (err) {
    if (err.message.includes("BUSYGROUP")) {
      console.log("[Redis] Consumer group already exists");
    } else {
      throw err;
    }
  }
}

/**
 * Redis Streams에서 컨슈머 그룹으로 메시지 읽기
 * @param {string} consumerName 컨슈머 이름
 * @param {number} count 최대 읽을 메시지 수
 * @param {number} block 대기 시간(ms)
 * @returns {Promise<Array>} 메시지 배열
 */
export async function readMessages(consumerName, count = 100, block = 5000) {
  const resp = await redis.xreadgroup(
    "GROUP",
    REDIS_CONSUMER_GROUP,
    consumerName,
    "COUNT",
    count,
    "BLOCK",
    block,
    "STREAMS",
    REDIS_STREAM_KEY,
    ">"
  );
  if (!resp) return [];
  return resp[0][1]; // 메시지 배열 [[id, [key, val, ...]], ...]
}

/**
 * 처리 완료한 메시지 ACK
 * @param {Array<string>} ids 메시지 ID 배열
 */
export async function ackMessages(ids) {
  if (ids.length === 0) return;
  await redis.xack(REDIS_STREAM_KEY, REDIS_CONSUMER_GROUP, ...ids);
  console.log(`[Redis] ACKed ${ids.length} messages`);
}

export default redis;
