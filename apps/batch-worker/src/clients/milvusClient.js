import { MilvusClient } from "@zilliz/milvus2-sdk-node";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// --- .env 파일 로딩 로직 (모노레포용) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });
// --- 로딩 로직 끝 ---

const MILVUS_ADDRESS = `${process.env.MILVUS_HOST}:${process.env.MILVUS_PORT}`;
let milvusClient = null;

/**
 * Milvus 클라이언트 인스턴스를 가져옵니다. (싱글턴)
 * @returns {MilvusClient}
 */
export function getMilvusClient() {
  if (!milvusClient) {
    console.log(`[Milvus] 클라이언트를 초기화합니다: ${MILVUS_ADDRESS}...`);
    
    if (!process.env.MILVUS_HOST || !process.env.MILVUS_PORT) {
        throw new Error("환경 변수 MILVUS_HOST 또는 MILVUS_PORT가 설정되지 않았습니다.");
    }

    milvusClient = new MilvusClient({
      address: MILVUS_ADDRESS,
      maxRetries: 5, // 연결 실패 시 재시도
      retryDelay: 2000, // 2초 간격으로 재시도
    });
    console.log('[Milvus] 클라이언트가 초기화되었습니다.');
  }
  return milvusClient;
}

