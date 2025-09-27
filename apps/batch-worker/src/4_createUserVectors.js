import fs from 'fs/promises';

const PREPROCESSED_FILE = './preprocessed_data.json';
const ITEM_VECTORS_FILE = './item_vectors.json';
const OUTPUT_FILE = './user_vectors.json';

/**
 * 사용자별 취향 벡터를 생성하는 메인 함수
 * 1. 전처리된 데이터(사용자-아이템 상호작용)와 아이템 벡터 데이터를 로드합니다.
 * 2. 사용자 ID를 기준으로 어떤 아이템들과 상호작용했는지 그룹화합니다.
 * 3. 각 사용자에 대해, 상호작용했던 아이템들의 벡터 평균을 계산하여 사용자의 대표 벡터를 생성합니다.
 * 4. 최종 결과를 { userId: vector } 형태의 JSON 파일로 저장합니다.
 */
async function runCreateUserVectors() {
  console.log('[Batch-4] 사용자 취향 벡터 생성을 시작합니다...');

  // 1. 필요 데이터 로드
  const preprocessedData = JSON.parse(await fs.readFile(PREPROCESSED_FILE, 'utf-8'));
  const itemVectors = JSON.parse(await fs.readFile(ITEM_VECTORS_FILE, 'utf-8'));
  console.log(`[Batch-4] ${preprocessedData.length}개의 상호작용 기록과 ${Object.keys(itemVectors).length}개의 아이템 벡터를 로드했습니다.`);

  // 2. 사용자별 아이템 상호작용 그룹화
  const userItemMap = new Map();
  for (const interaction of preprocessedData) {
    if (!userItemMap.has(interaction.userId)) {
      userItemMap.set(interaction.userId, []);
    }
    userItemMap.get(interaction.userId).push(interaction.itemId);
  }

  // 3. 사용자별 대표 벡터(취향) 계산
  const userVectors = {};
  console.log(`[Batch-4] ${userItemMap.size}명의 사용자에 대한 벡터를 생성합니다...`);

  for (const [userId, itemIds] of userItemMap.entries()) {
    const vectorsToAverage = itemIds
      .map(itemId => itemVectors[itemId]) // 각 아이템 ID에 해당하는 벡터를 찾음
      .filter(Boolean); // 벡터가 없는 아이템은 제외

    if (vectorsToAverage.length > 0) {
      userVectors[userId] = averageVectors(vectorsToAverage);
    }
  }

  // 4. 결과 파일 저장
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(userVectors, null, 2));
  console.log(`[Batch-4] 사용자 벡터를 ${OUTPUT_FILE}에 저장했습니다.`);
}

/**
 * 벡터 배열의 평균을 계산하는 헬퍼 함수
 * @param {number[][]} vectors 
 * @returns {number[]}
 */
function averageVectors(vectors) {
  if (vectors.length === 0) return [];
  if (vectors.length === 1) return vectors[0];

  const dimension = vectors[0].length;
  const sum = new Array(dimension).fill(0);

  for (const vec of vectors) {
    for (let i = 0; i < dimension; i++) {
      sum[i] += vec[i];
    }
  }

  return sum.map(s => s / vectors.length);
}

runCreateUserVectors();

