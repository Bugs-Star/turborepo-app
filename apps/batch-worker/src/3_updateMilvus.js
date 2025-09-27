import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";
import { getMilvusClient } from "./clients/milvusClient.js";
import fs from 'fs/promises';

const INPUT_FILE = './item_vectors.json';
const COLLECTION_NAME = "item_vectors";
const VECTOR_DIMENSION = 1024;

/**
 * Milvus에 필요한 컬렉션이 존재하는지 확인하고, 없으면 생성합니다.
 * @param {MilvusClient} milvusClient
 */
async function ensureCollection(milvusClient) {
  // ❗️ 타임아웃 추가: Milvus가 응답할 시간을 30초까지 기다립니다.
  const { value: hasCollection } = await milvusClient.hasCollection({
    collection_name: COLLECTION_NAME,
    timeout: 30000, // 30 seconds
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

  await milvusClient.createIndex({
    collection_name: COLLECTION_NAME,
    field_name: "vector",
    index_name: "vector_index",
    index_type: "IVF_FLAT",
    metric_type: "L2",
    params: { nlist: 128 },
    timeout: 30000,
  });

  console.log('[Batch-3] 컬렉션 및 인덱스 생성이 완료되었습니다.');
}

/**
 * 생성된 아이템 벡터를 Milvus에 업로드(upsert)하는 메인 함수
 */
async function runUpdateMilvus() {
  console.log('[Batch-3] Milvus 업데이트를 시작합니다...');

  const itemVectors = JSON.parse(await fs.readFile(INPUT_FILE, 'utf-8'));
  const itemIds = Object.keys(itemVectors);
  if (itemIds.length === 0) {
    console.log('[Batch-3] 업데이트할 아이템 벡터가 없습니다. 작업을 종료합니다.');
    return;
  }
  console.log(`[Batch-3] ${itemIds.length}개의 아이템 벡터를 파일에서 로드했습니다.`);

  const milvusClient = getMilvusClient();
  try {
    await ensureCollection(milvusClient);
    
    // ❗️ 타임아웃 추가: 컬렉션을 메모리에 로드할 시간을 30초까지 기다립니다.
    await milvusClient.loadCollection({
      collection_name: COLLECTION_NAME,
      timeout: 30000,
    });

    const dataForMilvus = itemIds.map(id => ({
      item_id: id,
      vector: itemVectors[id],
    }));

    console.log(`[Batch-3] ${dataForMilvus.length}개의 벡터를 Upsert합니다...`);
    const result = await milvusClient.upsert({
      collection_name: COLLECTION_NAME,
      data: dataForMilvus,
      timeout: 30000,
    });
    console.log('[Batch-3] Upsert가 성공적으로 완료되었습니다.', result);

  } catch (error) {
    console.error('[Batch-3] Milvus 벡터 업데이트에 실패했습니다:', error);
    throw error;
  } finally {
    await milvusClient.releaseCollection({
      collection_name: COLLECTION_NAME,
      timeout: 30000,
    });
  }
}

runUpdateMilvus();

