import { getClickHouseClient } from "./clients/clickhouseClient.js";
import { connectMongoDB, disconnectMongoDB } from "./clients/mongoClient.js";
import mongoose from 'mongoose';
import fs from 'fs/promises';

// --- Mongoose 스키마 및 모델 정의 ---
const productSchema = new mongoose.Schema({
  productCode: String,
  productName: String,
  productContents: String,
  category: String,
}, { 
  collection: 'products',
  versionKey: false
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

/**
 * 데이터 전처리 메인 함수 (최종)
 */
async function runPreprocessing() {
  console.log('[Batch-1] 데이터 전처리를 시작합니다...');
  try {
    await connectMongoDB();

    console.log('[Batch-1] MongoDB에서 상품 정보를 가져옵니다...');
    const allProducts = await Product.find({}, 'productCode productName productContents category -_id').lean();

    const productsMap = new Map(allProducts.map(p => [p.productCode, p]));
    console.log(`[Batch-1] ${productsMap.size}개의 상품 정보를 로드했습니다.`);

    console.log('[Batch-1] ClickHouse에서 사용자 로그를 가져옵니다...');
    const clickhouse = getClickHouseClient();
    
    // --- ❗️ 이 부분이 검증된 쿼리로 수정되었습니다 ---
    const query = `
      SELECT
        user_id,
        menu_id AS item_id,
        'purchase' AS event_type
      FROM orders
      WHERE ordered_at >= now() - INTERVAL 7 DAY
    `;
    // --- 수정 끝 ---

    const resultSet = await clickhouse.query({ query });
    const userLogs = (await resultSet.json()).data;

    if (!Array.isArray(userLogs)) throw new Error('ClickHouse 데이터가 올바른 형식이 아닙니다.');
    console.log(`[Batch-1] ${userLogs.length}개의 사용자 행동 로그를 로드했습니다.`);

    console.log('[Batch-1] 데이터를 결합하고 가공합니다...');
    const processedData = userLogs.map(log => {
      const productInfo = productsMap.get(log.item_id);
      if (!productInfo) return null;
      return {
        userId: log.user_id,
        itemId: log.item_id,
        eventType: log.event_type,
        textContent: `${productInfo.productName} ${productInfo.category} ${productInfo.productContents || ''}`,
      };
    }).filter(Boolean);
    console.log(`[Batch-1] 총 ${processedData.length}개의 상호작용 데이터를 처리했습니다.`);

    await fs.writeFile('./preprocessed_data.json', JSON.stringify(processedData, null, 2));
    console.log(`[Batch-1] 전처리된 데이터를 ./preprocessed_data.json에 저장했습니다.`);

  } catch (error) {
    console.error('[Batch-1] 전처리 작업 중 오류가 발생했습니다:', error);
    throw error;
  } finally {
    await disconnectMongoDB();
  }
}

runPreprocessing();

