import { createClient } from "@clickhouse/client";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// --- .env 파일 로딩 로직 (모노레포용) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });
// --- 로딩 로직 끝 ---
 
let client = null;

/**
 * ClickHouse 클라이언트 인스턴스를 가져옵니다. (싱글턴 패턴)
 * @returns {import("@clickhouse/client").ClickHouseClient}
 */
export function getClickHouseClient() {
  if (!client) {
    console.log('[ClickHouse] 클라이언트를 초기화합니다...');
    
    if (!process.env.CLICKHOUSE_HOST) {
        throw new Error("환경 변수 CLICKHOUSE_HOST가 설정되지 않았습니다. .env 파일을 확인해주세요.");
    }
    
    // URL 문자열 대신, 개별 속성으로 전달하여 안정성을 높입니다.
    client = createClient({
      host: process.env.CLICKHOUSE_HOST,
      username: process.env.CLICKHOUSE_USERNAME,
      password: process.env.CLICKHOUSE_PASSWORD,
      database: process.env.CLICKHOUSE_DATABASE || 'default',
    });
    console.log('[ClickHouse] 클라이언트가 초기화되었습니다.');
  }
  return client;
}

