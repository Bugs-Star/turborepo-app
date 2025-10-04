import { getMilvusClient } from "../clients/milvusClient.js";

const COLLECTION_NAME = "item_vectors";

async function checkCollectionStatus() {
  console.log(`[Check] Milvus 컬렉션 '${COLLECTION_NAME}'의 상태를 확인합니다...`);
  const milvusClient = getMilvusClient();
  try {
    const stats = await milvusClient.getCollectionStatistics({
      collection_name: COLLECTION_NAME
    });
    
    // --- ❗️ 이 부분이 수정되었습니다 ---
    // Milvus SDK는 stats.stats 안에 통계 데이터를 배열로 반환합니다.
    const entityCount = stats.stats.find(s => s.key === 'row_count')?.value || '0';
    // --- 수정 끝 ---
    
    console.log(`✅ [Check] 확인 완료: 컬렉션에 ${entityCount}개의 벡터가 저장되어 있습니다.`);

  } catch (error) {
    if (error.toString().includes("collection not found")) {
        console.error(`❌ [Check] 오류: '${COLLECTION_NAME}' 컬렉션이 Milvus에 존재하지 않습니다.`);
        console.error("-> 해결책: batch-worker를 먼저 성공적으로 실행하여 컬렉션을 생성해야 합니다.");
    } else {
        console.error("❌ [Check] Milvus 상태 확인 중 오류가 발생했습니다:", error);
    }
  }
}

checkCollectionStatus();