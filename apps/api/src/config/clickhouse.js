import dotenv from "dotenv";
import { createClient } from "@clickhouse/client";

dotenv.config();

const CLICKHOUSE_CONFIG = {
  host: process.env.CLICKHOUSE_HOST,
  username: process.env.CLICKHOUSE_USERNAME,
  password: process.env.CLICKHOUSE_PASSWORD,
  database: process.env.CLICKHOUSE_DATABASE || 'default',
};

const clickhouseClient = createClient(CLICKHOUSE_CONFIG);

export const queryDatabase = async (query) => {
  const resultSet = await clickhouseClient.query({
    query: query,
    format: 'JSONEachRow',
  });
  return await resultSet.json();
};

export const connectClickHouse = async () => {
  try {
    await clickhouseClient.query({ query: 'SELECT 1' });
    console.log('✅ ClickHouse 연결 성공');
  } catch (error) {
    console.error('Failed to connect to ClickHouse:', error);
  }
};

export default clickhouseClient;
