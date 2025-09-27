import { pipeline } from '@xenova/transformers';
import fs from 'fs/promises';

const INPUT_FILE = './preprocessed_data.json';
const OUTPUT_FILE = './item_vectors.json';
// 다국어 지원 모델을 사용하여 한국어 처리에 강점이 있습니다.
const MODEL_NAME = 'Xenova/multilingual-e5-large';

/**
 * 텍스트 데이터를 벡터로 변환(임베딩)하는 메인 함수
 * 1. 전처리된 데이터 파일을 읽어옵니다.
 * 2. 인공지능 모델을 로드합니다. (최초 실행 시 시간이 걸릴 수 있습니다)
 * 3. 각 고유 상품(itemId)의 텍스트 콘텐츠(textContent)를 추출합니다.
 * 4. 각 상품의 텍스트를 벡터로 변환합니다.
 * 5. 최종 결과를 { itemId: vector } 형태의 JSON 파일로 저장합니다.
 */
async function runEmbedding() {
  console.log('[Batch-2] 아이템 벡터 생성을 시작합니다...');

  // 1. 전처리 데이터 로드
  const preprocessedData = JSON.parse(await fs.readFile(INPUT_FILE, 'utf-8'));
  console.log(`[Batch-2] ${preprocessedData.length}개의 상호작용 기록을 로드했습니다.`);

  // 2. 인공지능 모델 로드
  console.log(`[Batch-2] 임베딩 모델 로드: ${MODEL_NAME}...`);
  // feature-extraction 파이프라인은 텍스트를 벡터로 변환하는 데 사용됩니다.
  const extractor = await pipeline('feature-extraction', MODEL_NAME, {
    quantized: true, // 모델 경량화로 메모리 사용량 및 처리 속도 개선
  });
  console.log('[Batch-2] 모델 로드가 완료되었습니다.');

  // 3. 고유 아이템과 텍스트 콘텐츠 추출
  const uniqueItems = new Map();
  for (const item of preprocessedData) {
    if (!uniqueItems.has(item.itemId)) {
      uniqueItems.set(item.itemId, item.textContent);
    }
  }

  // 4. 각 고유 아이템에 대한 벡터 생성
  const itemVectors = {};
  console.log(`[Batch-2] ${uniqueItems.size}개의 고유 아이템에 대한 벡터를 생성합니다...`);

  for (const [itemId, textContent] of uniqueItems.entries()) {
    // 모델을 사용해 텍스트를 벡터로 변환합니다.
    const output = await extractor(textContent, { pooling: 'mean', normalize: true });
    // tolist()를 통해 결과를 일반 JavaScript 배열로 변환합니다.
    itemVectors[itemId] = output.tolist()[0];
  }
  
  console.log('[Batch-2] 모든 아이템 벡터 생성이 완료되었습니다.');

  // 5. 결과 파일 저장
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(itemVectors, null, 2));
  console.log(`[Batch-2] 아이템 벡터를 ${OUTPUT_FILE}에 저장했습니다.`);
}

runEmbedding();

