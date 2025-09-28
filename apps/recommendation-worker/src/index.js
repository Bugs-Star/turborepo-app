// // --- .env 파일 로딩 및 경로 설정 ---
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const envPath = path.resolve(__dirname, '../.env');
// dotenv.config({ path: envPath });

// // --- 모듈 import ---
// import { getMilvusClient } from "./clients/milvusClient.js";
// import { getRedisClient } from "./clients/redisClient.js";
// import { getClickHouseClient } from "./clients/clickhouseClient.js";
// import fs from 'fs/promises';
// import crypto from 'crypto';

// // --- 설정 상수 ---
// const MILVUS_COLLECTION_NAME = "item_vectors";
// const USER_VECTORS_FILE = path.resolve(__dirname, '../../batch-worker/src/user_vectors.json');
// const REDIS_STREAM_KEY = "recommendation_tasks_stream";
// const REDIS_GROUP_NAME = "reco_worker_group";
// const CONSUMER_NAME = `reco_worker_${crypto.randomUUID()}`;
// const REDIS_RESULT_KEY_PREFIX = "reco_result:";
// const REDIS_RESULT_EXPIRE_SECONDS = 3600; // 1시간 동안 결과 유지

// let userVectorCache = {};

// async function loadUserVectors() {
//   console.log(`[Realtime] 사용자 벡터 로딩 시도: ${USER_VECTORS_FILE}...`);
//   try {
//     const data = await fs.readFile(USER_VECTORS_FILE, 'utf-8');
//     userVectorCache = JSON.parse(data);
//     console.log(`[Realtime] ${Object.keys(userVectorCache).length}명의 사용자 벡터를 캐시에 로드했습니다.`);
//   } catch (error) {
//     if (error.code === 'ENOENT') {
//       console.warn(`[Realtime] 경고: 사용자 벡터 파일(${USER_VECTORS_FILE})이 없습니다.`);
//     } else {
//       console.error('[Realtime] 사용자 벡터 파일을 로드할 수 없습니다:', error);
//     }
//   }
// }

// async function getPopularItemsFallback() {
//   console.log('[Fallback] 인기 상품 기반 추천을 생성합니다 (orders 테이블 기준)...');
//   try {
//     const clickhouse = getClickHouseClient();
//     const query = `
//       SELECT menu_id as item_id, count() as popularity
//       FROM orders
//       WHERE ordered_at >= now() - INTERVAL 1 DAY
//       GROUP BY item_id ORDER BY popularity DESC LIMIT 5
//     `;
//     const resultSet = await clickhouse.query({ query });
//     const popularItems = (await resultSet.json()).data;
//     return popularItems.map(item => ({ id: item.item_id, score: item.popularity }));
//   } catch(error) {
//     console.error('[Fallback] 인기 상품 추천 생성에 실패했습니다:', error);
//     return [];
//   }
// }

// function normalizeVector(vec) {
//   if (!vec) return [];
//   let sumOfSquares = 0;
//   for (const val of vec) { sumOfSquares += val * val; }
//   const magnitude = Math.sqrt(sumOfSquares);
//   if (magnitude === 0) return vec;
//   return vec.map(val => val / magnitude);
// }

// async function workerLoop() {
//   const redis = getRedisClient();
//   const milvus = getMilvusClient();
//   console.log(`✅ 실시간 추천 워커 '${CONSUMER_NAME}'가 실행되었습니다. 스트림 '${REDIS_STREAM_KEY}'에서 작업을 기다립니다...`);
//   while (true) {
//     try {
//       const response = await redis.xreadgroup(
//         'GROUP', REDIS_GROUP_NAME, CONSUMER_NAME,
//         'BLOCK', 0, 'COUNT', 1,
//         'STREAMS', REDIS_STREAM_KEY, '>'
//       );
//       if (!response) continue;
//       const [messageId, data] = response[0][1][0];
//       const { userId } = JSON.parse(data[1]);
//       console.log(`\n--- [Task Received] 사용자 '${userId}' 추천 시작 ---`);
      
//       const userVector = userVectorCache[userId];
//       let finalRecommendations = []; // 최종 추천 결과를 담을 변수

//       if (!userVector) {
//         console.warn(`[Realtime] 사용자 '${userId}'의 벡터를 찾을 수 없음. 폴백 추천 실행.`);
//         // ❗️ 수정: 계산 결과를 finalRecommendations에 저장합니다.
//         finalRecommendations = await getPopularItemsFallback();
//         console.log(`[Fallback Result] 추천 결과:`, finalRecommendations);
//       } else {
//         const normalizedUserVector = normalizeVector(userVector);
        
//         const searchResult = await milvus.search({
//           collection_name: MILVUS_COLLECTION_NAME, 
//           vector: normalizedUserVector,
//           limit: 5, 
//           output_fields: ["item_id"],
//           search_params: { metric_type: "IP", params: JSON.stringify({ nprobe: 16 }) },
//         });

//         // ❗️ 수정: 계산 결과를 finalRecommendations에 저장합니다.
//         finalRecommendations = searchResult.results.map(r => ({ id: r.item_id, score: r.score }));
//         console.log(`[Personalized Result] 추천 결과:`, finalRecommendations);
//       }

//       const resultKey = `${REDIS_RESULT_KEY_PREFIX}${userId}`;
//       await redis.set(
//         resultKey, 
//         JSON.stringify(finalRecommendations), 
//         'EX',
//         REDIS_RESULT_EXPIRE_SECONDS 
//       );
//       console.log(`[Redis] 사용자 '${userId}'의 추천 결과(${finalRecommendations.length}건)를 키 '${resultKey}'에 저장했습니다.`);

//       await redis.xack(REDIS_STREAM_KEY, REDIS_GROUP_NAME, messageId);
//       console.log(`--- [Task Complete] 사용자 '${userId}' 추천 완료 ---\n`);
//     } catch (error) {
//       console.error("❌ 실시간 워커 루프에서 오류가 발생했습니다:", error);
//       await new Promise(resolve => setTimeout(resolve, 5000));
//     }
//   }
// }

// async function waitForCollectionLoad(milvusClient) {
//   const maxWaitTime = 60000;
//   const interval = 2000;
//   let elapsedTime = 0;
//   console.log(`[Milvus] '${MILVUS_COLLECTION_NAME}' 컬렉션 로딩을 기다립니다...`);
//   while (elapsedTime < maxWaitTime) {
//     const progress = await milvusClient.getLoadingProgress({ collection_name: MILVUS_COLLECTION_NAME });
//     const loadingProgress = progress?.progress;
//     if (loadingProgress === '100') {
//       console.log('\n✅ [Milvus] 컬렉션이 100% 로드되었습니다.');
//       return true;
//     }
//     process.stdout.write(`[Milvus] 로딩 진행률: ${loadingProgress || 'N/A'}%\r`);
//     await new Promise(resolve => setTimeout(resolve, interval));
//     elapsedTime += interval;
//   }
//   console.error(`\n❌ [Milvus] 컬렉션 로딩 시간 초과 (${maxWaitTime / 1000}초).`);
//   return false;
// }

// async function main() {
//   console.log("🚀 실시간 추천 워커 초기화를 시작합니다...");
//   try {
//     await loadUserVectors();
//     const milvus = getMilvusClient();
//     const redis = getRedisClient();

//     console.log(`[Milvus] '${MILVUS_COLLECTION_NAME}' 컬렉션 존재 여부를 확인합니다...`);
//     const { value: hasCollection } = await milvus.hasCollection({
//         collection_name: MILVUS_COLLECTION_NAME,
//         timeout: 30000,
//     });
//     if (!hasCollection) throw new Error(`Milvus에 '${MILVUS_COLLECTION_NAME}' 컬렉션이 없습니다.`);

//     await milvus.loadCollection({ collection_name: MILVUS_COLLECTION_NAME });
//     const isLoaded = await waitForCollectionLoad(milvus);
//     if (!isLoaded) throw new Error("Milvus 컬렉션 로딩에 실패했습니다.");

//     try {
//       await redis.xgroup('CREATE', REDIS_STREAM_KEY, REDIS_GROUP_NAME, '$', 'MKSTREAM');
//       console.log(`[Redis] 그룹 '${REDIS_GROUP_NAME}'이(가) 생성되었습니다.`);
//     } catch (err) {
//       if (err.message.includes("BUSYGROUP")) {
//         console.log(`[Redis] 그룹 '${REDIS_GROUP_NAME}'이(가) 이미 존재합니다.`);
//       } else { throw err; }
//     }
    
//     workerLoop();
//   } catch (error) {
//     console.error("❌ 실시간 워커 초기화에 실패했습니다:", error);
//     process.exit(1);
//   }
// }

// main();






// --- .env 파일 로딩 및 경로 설정 (이전과 동일) ---
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });
const USER_VECTORS_FILE = path.resolve(__dirname, '../../batch-worker/src/user_vectors.json');
// --- 모듈 import (이전과 동일) ---
import { getMilvusClient } from "./clients/milvusClient.js";
import { getRedisClient } from "./clients/redisClient.js";
import { getClickHouseClient } from "./clients/clickhouseClient.js";
import fs from 'fs/promises';
import crypto from 'crypto';
// --- 상수 정의 (이전과 동일) ---
const MILVUS_COLLECTION_NAME = "item_vectors";
const REDIS_STREAM_KEY = "recommendation_tasks_stream";
const REDIS_GROUP_NAME = "reco_worker_group";
const CONSUMER_NAME = `reco_worker_${crypto.randomUUID()}`;
const REDIS_RESULT_KEY_PREFIX = "reco_result:";
const REDIS_RESULT_EXPIRE_SECONDS = 3600; // 1시간 동안 결과 유지
let userVectorCache = {};

// ... loadUserVectors, getPopularItemsFallback 함수는 이전과 동일 ...
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
async function getPopularItemsFallback() {
  console.log('[Fallback] 인기 상품 기반 추천을 생성합니다 (orders 테이블 기준)...');
  try {
    const clickhouse = getClickHouseClient();
    const query = `
      SELECT
        menu_id as item_id,
        count() as popularity
      FROM orders
      WHERE ordered_at >= now() - INTERVAL 1 DAY
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

// --- ❗️ 벡터 정규화를 위한 헬퍼 함수 추가 ---
function getVectorMagnitude(vec) {
  let sumOfSquares = 0;
  for (const val of vec) { sumOfSquares += val * val; }
  return Math.sqrt(sumOfSquares);
}
function normalizeVector(vec) {
  const magnitude = getVectorMagnitude(vec);
  if (magnitude === 0) return vec;
  return vec.map(val => val / magnitude);
}
// --- 함수 추가 끝 ---


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
      console.log(`\n--- [Task Received] 사용자 '${userId}' 추천 시작 ---`);
      const userVector = userVectorCache[userId];


      let recommendedItems = []
      if (!userVector) {
        console.warn(`[Realtime] 사용자 '${userId}'의 벡터를 찾을 수 없음. 폴백 추천 실행.`);
        const fallbackItems = await getPopularItemsFallback();
        console.log(`[Fallback Result] 추천 결과:`, fallbackItems);
      } else {
        // --- ❗️ 이 부분이 수정되었습니다 ---
        // Milvus에 보내기 직전에 사용자 벡터를 정규화하여 단위를 맞춰줍니다.
        const normalizedUserVector = normalizeVector(userVector);
        // --- 수정 끝 ---
        
        const searchResult = await milvus.search({
          collection_name: MILVUS_COLLECTION_NAME, 
          vector: normalizedUserVector, // 정규화된 벡터 사용
          limit: 5, 
          output_fields: ["item_id"],
        });
        recommendedItems = searchResult.results.map(r => ({ id: r.item_id, score: r.score }));
        console.log(`[Personalized Result] 추천 결과:`, recommendedItems);
      }

      // --- ❗️ 추천 결과를 Redis에 저장하는 로직 추가 ---
      const resultKey = `${REDIS_RESULT_KEY_PREFIX}${userId}`;
      await redis.set(
        resultKey, 
        JSON.stringify(recommendedItems), 
        'EX', // 만료 시간(초) 설정
        REDIS_RESULT_EXPIRE_SECONDS 
      );
      console.log(`[Redis] 사용자 '${userId}'의 추천 결과(${recommendedItems.length}건)를 키 '${resultKey}'에 저장했습니다.`);
      // --- 추가 끝 ---

      await redis.xack(REDIS_STREAM_KEY, REDIS_GROUP_NAME, messageId);
      console.log(`--- [Task Complete] 사용자 '${userId}' 추천 완료 ---\n`);
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

    console.log(`[Milvus] '${MILVUS_COLLECTION_NAME}' 컬렉션 존재 여부를 확인합니다...`);
    const { value: hasCollection } = await milvus.hasCollection({
        collection_name: MILVUS_COLLECTION_NAME,
        timeout: 30000,
    });

    if (!hasCollection) {
        throw new Error(`Milvus에 '${MILVUS_COLLECTION_NAME}' 컬렉션이 없습니다. batch-worker를 먼저 실행하세요.`);
    }

    await milvus.loadCollection({ collection_name: MILVUS_COLLECTION_NAME });
    const isLoaded = await waitForCollectionLoad(milvus);
    if (!isLoaded) {
        throw new Error("Milvus 컬렉션 로딩에 실패했습니다.");
    }

    try {
      await redis.xgroup('CREATE', REDIS_STREAM_KEY, REDIS_GROUP_NAME, '$', 'MKSTREAM');
      console.log(`[Redis] 그룹 '${REDIS_GROUP_NAME}'이(가) 생성되었습니다.`);
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

/**
 * Milvus 컬렉션 로딩이 100% 완료될 때까지 기다리는 함수.
 */
async function waitForCollectionLoad(milvusClient) {
  const maxWaitTime = 60000;
  const interval = 2000;
  let elapsedTime = 0;

  console.log(`[Milvus] '${MILVUS_COLLECTION_NAME}' 컬렉션 로딩을 기다립니다...`);

  while (elapsedTime < maxWaitTime) {
    const progress = await milvusClient.getLoadingProgress({
      collection_name: MILVUS_COLLECTION_NAME,
    });
    
    const loadingProgress = progress?.progress;

    if (loadingProgress === '100') {
      console.log('\n✅ [Milvus] 컬렉션이 100% 로드되었습니다.');
      return true;
    }

    process.stdout.write(`[Milvus] 로딩 진행률: ${loadingProgress || 'N/A'}%\r`);

    await new Promise(resolve => setTimeout(resolve, interval));
    elapsedTime += interval;
  }

  console.error(`\n❌ [Milvus] 컬렉션 로딩 시간 초과 (${maxWaitTime / 1000}초).`);
  return false;
}

main();

