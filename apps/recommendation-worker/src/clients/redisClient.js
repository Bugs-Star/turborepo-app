import Redis from "ioredis";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// --- .env 파일 로딩 로직 (모노레포용) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

let redisClient = null;

/**
 * Redis 클라이언트 인스턴스를 가져옵니다. (싱글턴)
 * @returns {Redis}
 */
export function getRedisClient() {
  if (!redisClient) {
    console.log('[Redis] 클라이언트를 초기화합니다...');
    
    if (!process.env.REDIS_URL) {
      throw new Error("환경 변수 REDIS_URL이 설정되지 않았습니다. .env 파일을 확인해주세요.");
    }

    redisClient = new Redis(process.env.REDIS_URL, {
        // 스트림을 BLOCK 모드로 읽을 때, 타임아웃 오류가 발생하지 않도록 설정합니다.
        maxRetriesPerRequest: null
    });
    console.log("[Redis] 클라이언트가 초기화되었습니다.");
  }
  return redisClient;
}

