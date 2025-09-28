import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";
import { getMilvusClient } from "./clients/milvusClient.js";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// --- 경로 설정 로직 ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_DIR = path.resolve(__dirname, '../'); // src 폴더 밖으로 나감
const INPUT_FILE = path.join(BASE_DIR, 'item_vectors.json');
// --- 경로 설정 끝 ---

const COLLECTION_NAME = "item_vectors";
const VECTOR_DIMENSION = 1024;

async function ensureCollection(milvusClient) {
  const { value: hasCollection } = await milvusClient.hasCollection({
    collection_name: COLLECTION_NAME,
    timeout: 30000,
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
    timeout: 30000,
  });

  // --- ❗️ 이 부분이 수정되었습니다 ---
  // 거리 측정 방식을 'IP'(내적)로 변경하여 코사인 유사도 검색을 수행합니다.
  await milvusClient.createIndex({
    collection_name: COLLECTION_NAME,
    field_name: "vector",
    index_name: "vector_index",
    index_type: "IVF_FLAT",
    metric_type: "IP", // L2 -> IP
    params: { nlist: 128 },
    timeout: 30000,
  });
  // --- 수정 끝 ---

  console.log('[Batch-3] 컬렉션 및 인덱스 생성이 완료되었습니다.');
}

async function runUpdateMilvus() {
    // ... (이하 로직은 이전과 동일)
}

runUpdateMilvus();

