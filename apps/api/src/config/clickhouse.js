/* ------------------------------------------------------------
 * File      : /config/clickhouse.js
 * Brief     : ClickHouse 설정 파일
 * Author    : 송용훈
 * Date      : 2025-09-02
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import { createClient } from "@clickhouse/client";
import dotenv from 'dotenv';
dotenv.config();

// ClickHouse 설정 객체
const CLICKHOUSE_CONFIG = {
  url: `https://${process.env.CLICKHOUSE_USERNAME}:${process.env.CLICKHOUSE_PASSWORD}@${process.env.CLICKHOUSE_HOST.replace('https://', '')}`,
  database: process.env.CLICKHOUSE_DATABASE || 'default',
};

// ClickHouse 클라이언트 생성
const clickhouseClient = createClient(CLICKHOUSE_CONFIG);

// ClickHouse 쿼리
// 사용 예시
// const userInput = "some_user_id";
// const query = 'SELECT * FROM logs WHERE user_id = {userId:String}';
// const results = await queryDatabase(query, { userId: userInput });
export const queryDatabase = async (query, params = {}) => {
  const resultSet = await clickhouseClient.query({
    query: query,
    query_params: params,
    format: 'JSONEachRow',
  });
  return await resultSet.json();
};

// ClickHouse 연결
export const connectClickHouse = async () => {
  try {
    await clickhouseClient.query({ query: 'SELECT 1' });
    console.log('✅ ClickHouse 연결 성공');
    startKeepAlive();
  } catch (error) {
    console.error('❌ ClickHouse 연결 실패:', error);
  }
};

// ClickHouse 연결 종료 함수
export const disconnectClickHouse = async () => {
  try {
    await clickhouseClient.close();   // Use the close() method to gracefully disconnect.
    console.log('🔌 ClickHouse 연결 종료');
  } catch (error) {
    console.error('❌ ClickHouse 연결 종료 실패:', error);
  }
};

// ClickHouse Keep-Alive 함수
const keepAlive = async () => {
  try {
    await clickhouseClient.query({ query: 'SELECT 1 as ping' });
    // console.log('🔄 ClickHouse Keep-Alive 성공');
  } catch (error) {
    // 연결이 닫혔을 때는 조용히 무시
    if (error.message?.includes('closed') || error.message?.includes('destroyed')) {
      return;
    }
    // console.error('❌ ClickHouse Keep-Alive 실패:', error);
  }
};

// Keep-Alive 스케줄러
let keepAliveInterval = null;

export const startKeepAlive = () => {
  // 5분마다 keep-alive 쿼리 실행
  keepAliveInterval = setInterval(() => {
    keepAlive();
  }, 5 * 60 * 1000); // 5분 = 300,000ms
};

export default clickhouseClient;
