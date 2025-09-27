// --- .env 파일 로딩을 위해 최상단에 위치 ---
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ❗️ 현재 파일의 절대 경로를 기준으로 다른 파일들의 경로를 계산합니다.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. 프로젝트 루트에 있는 .env 파일의 절대 경로를 계산합니다.
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

// 2. batch-worker에 있는 user_vectors.json 파일의 절대 경로를 계산합니다.
const USER_VECTORS_FILE = path.resolve(__dirname, '../../batch-worker/src/user_vectors.json');
// --- 경로 설정 로직 끝 ---

import { getMilvusClient } from "./clients/milvusClient.js";
import { getRedisClient } from "./clients/redisClient.js";
import { getClickHouseClient } from "./clients/clickhouseClient.js";
import fs from 'fs/promises';
import crypto from 'crypto';

// --- 설정 상수 ---
const MILVUS_COLLECTION_NAME = "item_vectors";
const REDIS_STREAM_KEY = "recommendation_tasks_stream";
const REDIS_GROUP_NAME = "reco_worker_group";
const CONSUMER_NAME = `reco_worker_${crypto.randomUUID()}`;

let userVectorCache = {}; // 사용자 벡터 메모리 캐시

/**
 * 배치 워커가 생성한 사용자 벡터 파일을 읽어 메모리에 캐싱합니다.
 */
async function loadUserVectors() {
  console.log(`[Realtime] 사용자 벡터 로딩 시도: ${USER_VECTORS_FILE}...`);
  try {
    const data = await fs.readFile(USER_VECTORS_FILE, 'utf-8');
    userVectorCache = JSON.parse(data);
    console.log(`[Realtime] ${Object.keys(userVectorCache).length}명의 사용자 벡터를 캐시에 로드했습니다.`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(`[Realtime] 경고: 사용자 벡터 파일(${USER_VECTORS_FILE})이 없습니다. 비개인화 추천으로만 동작합니다.`);
    } else {
      console.error('[Realtime] 사용자 벡터 파일을 로드할 수 없습니다:', error);
    }
  }
}

/**
 * 개인화 추천이 불가능할 때, 인기 상품을 추천하는 폴백(Fallback) 함수
 */
async function getPopularItemsFallback() {
  console.log('[Fallback] 인기 상품 기반 추천을 생성합니다...');
  try {
    const clickhouse = getClickHouseClient();
    const query = `
      SELECT JSONExtractString(toString(metadata), 'productCode') as item_id, count() as popularity
      FROM events
      WHERE event_time >= now() - INTERVAL 1 DAY
      GROUP BY item_id
      ORDER BY popularity DESC
      LIMIT 5
    `;
    const resultSet = await clickhouse.query({ query });
    const popularItems = (await resultSet.json()).data;
    return popularItems.map(item => ({ id: item.item_id, score: item.popularity }));
  } catch(error) {
    console.error('[Fallback] 인기 상품 추천 생성에 실패했습니다:', error);
    return [];
  }
}

/**
 * Redis Stream에서 작업을 읽어와 개인화 추천을 수행하는 메인 루프
 */
async function workerLoop() {
  const redis = getRedisClient();
  const milvus = getMilvusClient();
  
  console.log(`✅ 실시간 추천 워커 '${CONSUMER_NAME}'가 실행되었습니다. 스트림 '${REDIS_STREAM_KEY}'에서 작업을 기다립니다...`);

  while (true) {
    try {
      const response = await redis.xreadgroup(
        'GROUP', REDIS_GROUP_NAME, CONSUMER_NAME,
        'BLOCK', 0, 'COUNT', 1,
        'STREAMS', REDIS_STREAM_KEY, '>'
      );
      
      if (!response) continue;

      const [messageId, data] = response[0][1][0];
      const { userId } = JSON.parse(data[1]);
      console.log(`[Task Received] 사용자 '${userId}'에 대한 추천을 시작합니다.`);
      
      const userVector = userVectorCache[userId];

      if (!userVector) {
        console.warn(`[Realtime] 사용자 '${userId}'의 벡터를 찾을 수 없습니다. 폴백 추천을 시도합니다.`);
        const fallbackItems = await getPopularItemsFallback();
        console.log(`[Fallback Result] 사용자 '${userId}' 추천 결과:`, fallbackItems);
      } else {
        const searchResult = await milvus.search({
          collection_name: MILVUS_COLLECTION_NAME,
          vector: userVector,
          limit: 5,
          output_fields: ["item_id"],
          timeout: 5000, // 검색 시에도 5초 타임아웃 추가
        });
        const recommendedItems = searchResult.results.map(r => ({ id: r.id, score: r.score }));
        console.log(`[Personalized Result] 사용자 '${userId}' 추천 결과:`, recommendedItems);
      }

      await redis.xack(REDIS_STREAM_KEY, REDIS_GROUP_NAME, messageId);

    } catch (error) {
      console.error("❌ 실시간 워커 루프에서 오류가 발생했습니다:", error);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

/**
 * 워커를 시작하는 메인 함수
 */
async function main() {
  console.log("🚀 실시간 추천 워커 초기화를 시작합니다...");
  try {
    await loadUserVectors();
    const milvus = getMilvusClient();
    const redis = getRedisClient();

    // --- ❗️ 이 부분이 수정되었습니다 ---
    console.log(`[Milvus] '${MILVUS_COLLECTION_NAME}' 컬렉션 존재 여부를 확인합니다...`);
    const { value: hasCollection } = await milvus.hasCollection({
        collection_name: MILVUS_COLLECTION_NAME,
        timeout: 30000, // 30초까지 대기
    });

    if (!hasCollection) {
        console.error(`❌ 중요 에러: Milvus에 '${MILVUS_COLLECTION_NAME}' 컬렉션이 없습니다.`);
        console.error("먼저 batch-worker를 성공적으로 실행하여 컬렉션과 데이터를 생성해야 합니다.");
        throw new Error(`Milvus collection '${MILVUS_COLLECTION_NAME}' not found.`);
    }

    console.log("[Milvus] 컬렉션 존재 확인. 메모리 로딩을 시작합니다...");
    await milvus.loadCollection({
      collection_name: MILVUS_COLLECTION_NAME,
      timeout: 30000, // 30초까지 대기
    });
    // --- 수정 끝 ---
    console.log("[Milvus] 컬렉션이 성공적으로 로드되었습니다.");

    try {
      await redis.xgroup('CREATE', REDIS_STREAM_KEY, REDIS_GROUP_NAME, '$', 'MKSTREAM');
      console.log(`[Redis] 그룹 '${REDIS_GROUP_NAME}'이(가) 스트림 '${REDIS_STREAM_KEY}'에 생성되었습니다.`);
    } catch (err) {
      if (err.message.includes("BUSYGROUP")) {
        console.log(`[Redis] 그룹 '${REDIS_GROUP_NAME}'이(가) 이미 존재합니다.`);
      } else { throw err; }
    }
    
    workerLoop();
  } catch (error) {
    console.error("❌ 실시간 워커 초기화에 실패했습니다:", error);
    process.exit(1);
  }
}

main();

