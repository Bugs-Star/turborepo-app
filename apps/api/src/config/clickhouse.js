/* ------------------------------------------------------------
 * File      : current_file
 * Brief     : 
 * Author    : 송용훈
 * Date      : 2025-09-08
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import { createClient } from "@clickhouse/client";


// ClickHouse 설정 객체
const CLICKHOUSE_CONFIG = {
  host: process.env.CLICKHOUSE_HOST,
  username: process.env.CLICKHOUSE_USERNAME,
  password: process.env.CLICKHOUSE_PASSWORD,
  database: process.env.CLICKHOUSE_DATABASE || 'default',
};

// ClickHouse 클라이언트 생성
const clickhouseClient = createClient(CLICKHOUSE_CONFIG);

// ClickHouse 쿼리
export const queryDatabase = async (query) => {
  const resultSet = await clickhouseClient.query({
    query: query,
    format: 'JSONEachRow',
  });
  return await resultSet.json();
};

// ClickHouse 연결
export const connectClickHouse = async () => {
  try {
    await clickhouseClient.query({ query: 'SELECT 1' });
    console.log('✅ ClickHouse 연결 성공');
  } catch (error) {
    console.error('❌ ClickHouse 연결 실패:', error);
  }
};

// ClickHouse 연결 종료 함수
export const disconnectClickHouse = async () => {
  try {
    // Use the close() method to gracefully disconnect.
    await clickhouseClient.close();
    console.log('🔌 ClickHouse 연결 종료');
  } catch (error) {
    console.error('❌ ClickHouse 연결 종료 실패:', error);
  }
};

export default clickhouseClient;
