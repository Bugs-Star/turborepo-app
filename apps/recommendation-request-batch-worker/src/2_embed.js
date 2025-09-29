import { pipeline } from '@xenova/transformers';
import fs from 'fs/promises';

const INPUT_FILE = '../preprocessed_data.json';
const OUTPUT_FILE = '../item_vectors.json';
// 다국어 지원이 뛰어난 모델을 사용하여 한국어 처리에 강점이 있습니다.
const MODEL_NAME = 'Xenova/multilingual-e5-large';

/**
 * 텍스트 데이터를 벡터로 변환(임베딩)하는 메인 함수
 */
async function runEmbedding() {
  console.log('[Batch-2] 아이템 벡터 생성을 시작합니다...');
  const preprocessedData = JSON.parse(await fs.readFile(INPUT_FILE, 'utf-8'));
  console.log(`[Batch-2] ${preprocessedData.length}개의 상호작용 기록을 로드했습니다.`);

  console.log(`[Batch-2] 임베딩 모델 로드: ${MODEL_NAME}... (최초 실행 시 시간이 다소 걸릴 수 있습니다)`);
  // 'quantized: true' 옵션은 모델을 경량화하여 메모리 사용량을 줄이고 속도를 향상시킵니다.
  const extractor = await pipeline('feature-extraction', MODEL_NAME, { quantized: true });
  console.log('[Batch-2] 모델 로드가 완료되었습니다.');

  // 각 아이템(itemId)별로 고유한 텍스트(textContent)를 Set으로 그룹화하여 중복을 제거합니다.
  const itemsTextMap = new Map();
  preprocessedData.forEach(item => {
    if (!itemsTextMap.has(item.itemId)) {
      itemsTextMap.set(item.itemId, new Set());
    }
    itemsTextMap.get(item.itemId).add(item.textContent);
  });
  
  const itemVectors = {};
  console.log(`[Batch-2] ${itemsTextMap.size}개의 고유 아이템에 대한 벡터를 생성합니다...`);

  let count = 0;
  for (const [itemId, texts] of itemsTextMap.entries()) {
    count++;
    // Set을 배열로 변환하여 모델에 입력합니다.
    const textArray = Array.from(texts);
    // 모델을 사용해 텍스트들을 벡터로 변환합니다. 'mean' 풀링은 여러 텍스트의 의미를 평균내어 하나의 벡터로 만듭니다.
    const embeddings = await extractor(textArray, { pooling: 'mean', normalize: true });
    
    // 결과 벡터를 itemVectors 객체에 저장합니다.
    itemVectors[itemId] = embeddings.tolist()[0]; 
    
    // 진행 상황을 터미널에 표시합니다.
    process.stdout.write(`[Batch-2] 진행률: ${count} / ${itemsTextMap.size}\r`);
  }
  
  console.log('\n[Batch-2] 모든 아이템 벡터 생성이 완료되었습니다.');
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(itemVectors, null, 2));
  console.log(`[Batch-2] 아이템 벡터를 ${OUTPUT_FILE}에 저장했습니다.`);
}

runEmbedding();

