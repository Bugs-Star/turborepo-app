import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";
import { getMilvusClient } from "./clients/milvusClient.js";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// --- 경로 설정 로직 ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INPUT_FILE = path.join(__dirname, '../item_vectors.json');
// --- 경로 설정 끝 ---

const COLLECTION_NAME = "item_vectors";
const VECTOR_DIMENSION = 1024; // 사용하는 임베딩 모델(e.g., multilingual-e5-large)의 차원 수

/**
 * Milvus에 컬렉션이 존재하는지 확인하고, 없으면 새로 생성합니다.
 * @param {MilvusClient} milvusClient 
 */
async function ensureCollection(milvusClient) {
  const { value: hasCollection } = await milvusClient.hasCollection({
    collection_name: COLLECTION_NAME,
  });

  if (hasCollection) {
    console.log(`[Batch-3] 컬렉션 '${COLLECTION_NAME}'이(가) 이미 존재합니다.`);
    return;
  }

  console.log(`[Batch-3] 컬렉션이 없습니다. '${COLLECTION_NAME}'을(를) 생성합니다...`);
  await milvusClient.createCollection({
    collection_name: COLLECTION_NAME,
    fields: [
      { name: "item_id", data_type: DataType.VarChar, is_primary_key: true, max_length: 256 },
      { name: "vector", data_type: DataType.FloatVector, dim: VECTOR_DIMENSION },
    ],
  });

  console.log(`[Batch-3] '${COLLECTION_NAME}' 컬렉션에 대한 인덱스를 생성합니다...`);
  await milvusClient.createIndex({
    collection_name: COLLECTION_NAME,
    field_name: "vector",
    index_name: "vector_index",
    index_type: "IVF_FLAT",
    metric_type: "IP",
    params: { nlist: 128 },
  });

  console.log('[Batch-3] 컬렉션 및 인덱스 생성이 완료되었습니다.');
}

/**
 * 메인 실행 함수: JSON 파일을 읽어 Milvus에 데이터를 업데이트합니다.
 */
async function runUpdateMilvus() {
  console.log('[Batch-3] Milvus 데이터 업데이트를 시작합니다.');
  let milvusClient;

  try {
    milvusClient = getMilvusClient();

    // 1. 컬렉션 확인 및 생성
    await ensureCollection(milvusClient);

    // 2. 로컬 JSON 파일에서 아이템 벡터 읽기
    console.log(`[Batch-3] '${INPUT_FILE}' 파일에서 아이템 벡터를 로드합니다...`);
    const fileContent = await fs.readFile(INPUT_FILE, 'utf-8');
    const itemVectorsObject = JSON.parse(fileContent);

    // [수정] Milvus SDK 형식에 맞게 객체를 배열로 변환합니다.
    // e.g., { "id1": [vec] } -> [{ "item_id": "id1", "vector": [vec] }]
    const items = Object.entries(itemVectorsObject).map(([itemId, vector]) => ({
      item_id: itemId,
      vector: vector,
    }));

    if (!items || items.length === 0) {
      console.log('[Batch-3] Milvus에 업데이트할 데이터가 없습니다. 작업을 종료합니다.');
      return;
    }
    console.log(`[Batch-3] ${items.length}개의 아이템 벡터를 Milvus에 업로드합니다.`);

    // 3. 데이터 Upsert (데이터가 없으면 Insert, 있으면 Update)
    const upsertResponse = await milvusClient.upsert({
      collection_name: COLLECTION_NAME,
      data: items, // 변환된 데이터를 사용
      timeout: 40000, // 40초
    });
    console.log('[Batch-3] 데이터 Upsert 완료:', upsertResponse);

    // 4. 검색을 위해 컬렉션을 메모리로 로드
    console.log(`[Batch-3] '${COLLECTION_NAME}' 컬렉션을 검색 가능하도록 메모리에 로드합니다...`);
    await milvusClient.loadCollection({
      collection_name: COLLECTION_NAME,
      timeout: 40000, // 40초
    });
    console.log(`[Batch-3] 컬렉션 로드가 완료되었습니다. 이제 검색이 가능합니다.`);

  } catch (error) {
    console.error('[Batch-3] 스크립트 실행 중 치명적인 오류가 발생했습니다:', error);
    process.exit(1); // 오류 발생 시 스크립트를 비정상 종료
  }
}

// 스크립트 실행
runUpdateMilvus();

