import fs from 'fs/promises';

const PREPROCESSED_FILE = './preprocessed_data.json';
const ITEM_VECTORS_FILE = './item_vectors.json';
const OUTPUT_FILE = './user_vectors.json';

// --- 벡터 정규화를 위한 헬퍼 함수 ---
/**
 * 벡터의 크기(L2 Norm)를 계산합니다.
 * @param {number[]} vec 
 * @returns {number}
 */
function getVectorMagnitude(vec) {
  let sumOfSquares = 0;
  for (const val of vec) {
    sumOfSquares += val * val;
  }
  return Math.sqrt(sumOfSquares);
}

/**
 * 벡터를 정규화하여 크기를 1로 만듭니다.
 * @param {number[]} vec 
 * @returns {number[]}
 */
function normalizeVector(vec) {
  const magnitude = getVectorMagnitude(vec);
  if (magnitude === 0) return vec; // 0으로 나누는 것을 방지
  return vec.map(val => val / magnitude);
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

/**
 * 사용자별 취향 벡터를 생성하는 메인 함수
 */
async function runCreateUserVectors() {
  console.log('[Batch-4] 사용자 취향 벡터 생성을 시작합니다...');

  const preprocessedData = JSON.parse(await fs.readFile(PREPROCESSED_FILE, 'utf-8'));
  const itemVectors = JSON.parse(await fs.readFile(ITEM_VECTORS_FILE, 'utf-8'));
  console.log(`[Batch-4] ${preprocessedData.length}개의 상호작용 기록과 ${Object.keys(itemVectors).length}개의 아이템 벡터를 로드했습니다.`);

  const userItemMap = new Map();
  for (const interaction of preprocessedData) {
    if (!userItemMap.has(interaction.userId)) {
      userItemMap.set(interaction.userId, []);
    }
    userItemMap.get(interaction.userId).push(interaction.itemId);
  }

  const userVectors = {};
  console.log(`[Batch-4] ${userItemMap.size}명의 사용자에 대한 벡터를 생성합니다...`);

  for (const [userId, itemIds] of userItemMap.entries()) {
    const vectorsToAverage = itemIds
      .map(itemId => itemVectors[itemId])
      .filter(Boolean);

    if (vectorsToAverage.length > 0) {
      const avgVector = averageVectors(vectorsToAverage);
      // 평균 벡터를 정규화하여 Milvus의 아이템 벡터와 단위를 맞춥니다.
      userVectors[userId] = normalizeVector(avgVector);
    }
  }

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(userVectors, null, 2));
  console.log(`[Batch-4] 정규화된 사용자 벡터를 ${OUTPUT_FILE}에 저장했습니다.`);
}

runCreateUserVectors();

