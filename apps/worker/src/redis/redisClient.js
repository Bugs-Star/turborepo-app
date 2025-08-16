// redisClient.js

// ioredis 라이브러리를 불러옴.
// ioredis는 Node.js 환경에서 Redis와 통신할 수 있도록 해주는 인기 있는 Redis 클라이언트.
import Redis from "ioredis";

// 환경설정(config.js)에서 Redis Streams 키 이름과 컨슈머 그룹 이름을 불러옴.
// - REDIS_STREAM_KEY : 메시지가 쌓일 Stream의 이름
// - REDIS_CONSUMER_GROUP : 메시지를 읽을 컨슈머 그룹 이름
import { REDIS_STREAM_KEY, REDIS_CONSUMER_GROUP } from "../config/config.js";

// Redis 연결 객체 생성.
// 기본적으로 localhost:6379로 연결하며, 필요하면 환경변수나 옵션으로 설정 가능.
const redis = new Redis();

/**
 * 컨슈머 그룹이 존재하지 않으면 생성하는 함수
 * - Redis Streams는 XGROUP CREATE 명령으로 컨슈머 그룹을 만들어야 메시지를 읽을 수 있음
 * - "MKSTREAM" 옵션을 주면 Stream이 없을 경우 자동으로 생성
 * - "$"는 현재 시점 이후의 메시지만 읽겠다는 의미
 */
export async function ensureConsumerGroup() {
  try {
    await redis.xgroup(
      "CREATE", // XGROUP CREATE 명령
      REDIS_STREAM_KEY, // 스트림 이름
      REDIS_CONSUMER_GROUP, // 컨슈머 그룹 이름
      "$", // 시작 위치: 현재 이후의 메시지만 읽음
      "MKSTREAM" // 스트림이 없으면 자동 생성
    );
    console.log("[Redis] Consumer group created");
  } catch (err) {
    // 이미 컨슈머 그룹이 존재할 경우 BUSYGROUP 에러 발생 → 무시
    if (err.message.includes("BUSYGROUP")) {
      console.log("[Redis] Consumer group already exists");
    } else {
      // 다른 오류는 그대로 throw
      throw err;
    }
  }
}

/**
 * 컨슈머 그룹에서 메시지를 읽는 함수
 * @param {string} consumerName - 현재 실행 중인 컨슈머(Worker)의 이름
 * @param {number} count - 한 번에 읽을 최대 메시지 개수 (기본 100)
 * @param {number} block - 메시지가 없을 때 대기할 최대 시간(ms) (기본 5초)
 * @returns {Promise<Array>} - 메시지 배열
 *
 * Redis Streams의 XREADGROUP 명령을 사용:
 * - "GROUP" : 컨슈머 그룹 모드로 읽기
 * - ">" : 아직 읽히지 않은 새 메시지만 가져오기
 * - BLOCK : 메시지가 없을 경우 일정 시간 대기
 */
export async function readMessages(consumerName, count = 100, block = 5000) {
  const resp = await redis.xreadgroup(
    "GROUP", // XREADGROUP: 컨슈머 그룹 기반 읽기
    REDIS_CONSUMER_GROUP, // 컨슈머 그룹 이름
    consumerName, // 컨슈머(Worker) 이름
    "COUNT",
    count, // 한 번에 읽을 최대 개수
    "BLOCK",
    block, // 대기 시간(ms)
    "STREAMS",
    REDIS_STREAM_KEY, // 읽을 스트림 이름
    ">" // ">" → 아직 소비되지 않은 새 메시지만 읽음
  );

  // resp가 null이면 메시지가 없다는 뜻 → 빈 배열 반환
  if (!resp) return [];

  // resp 구조:
  // [
  //   [ streamName, [
  //       [ messageId, [ key1, val1, key2, val2, ... ] ],
  //       ...
  //     ]
  //   ]
  // ]
  // 따라서 resp[0][1]이 실제 메시지 목록.
  return resp[0][1];
}

/**
 * 메시지 처리가 끝난 후 컨슈머 그룹에 ACK 보내기
 * @param {Array<string>} ids - 처리 완료한 메시지 ID 목록
 *
 * XACK 명령을 사용:
 * - ACK를 보내면 해당 메시지는 "pending" 상태에서 제거됨
 * - ACK를 보내지 않으면, 메시지가 계속 pending 상태에 남아있어
 *   다른 컨슈머가 재처리할 수 있음(장애 복구 시 활용)
 */
export async function ackMessages(ids) {
  if (ids.length === 0) return; // 처리할 메시지가 없으면 종료
  await redis.xack(
    REDIS_STREAM_KEY, // 스트림 이름
    REDIS_CONSUMER_GROUP, // 컨슈머 그룹 이름
    ...ids // ACK할 메시지 ID 목록
  );
  console.log(`[Redis] ACKed ${ids.length} messages`);
}

// redis 연결 객체를 기본 내보내기.
// 다른 모듈에서 redis 명령을 직접 호출할 때 사용 가능.
export default redis;
