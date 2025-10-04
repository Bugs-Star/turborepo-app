// fetchAggregations.js
import fetch from "node-fetch"; // Node.js 환경용 fetch

// VirtualFront 서버 URL
const BASE_URL = "http://localhost:" + FRONT_PORT;

/**
 * ClickHouse 집계 데이터를 가져옵니다.
 * @param {string} aggregationType - "summaryStats" | "bestSellers" | "goldenPath"
 * @param {string} period - "weekly" | "monthly"
 * @returns {Promise<Array>} 데이터 배열
 */
export async function getAggregationData(aggregationType, period) {
  try {
    const url = `${BASE_URL}/aggregations/${aggregationType}/${period}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Server responded with status ${res.status}`);
    }

    const json = await res.json();
    return json.data; // 실제 데이터 배열만 반환
  } catch (err) {
    console.error("Failed to fetch aggregation data:", err);
    return [];
  }
}

// ==============================
// 테스트용 실행 예시
// ==============================
async function test() {
  const weeklyStats = await getAggregationData("summaryStats", "weekly");
  console.log("Weekly Summary Stats:", weeklyStats);

  const monthlyStats = await getAggregationData("summaryStats", "monthly");
  console.log("Monthly Summary Stats:", monthlyStats);
}

// Node에서 직접 실행 시
if (import.meta.url === `file://${process.argv[1]}`) {
  test();
}
