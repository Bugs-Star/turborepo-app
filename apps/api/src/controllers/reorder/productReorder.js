/* ------------------------------------------------------------
 * File      : /controllers/reorder/productReorder.js
 * Brief     : 추천 상품 순서 변경 컨트롤러
 * Author    : 노인영
 * Date      : 2025-09-10
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import mongoose from 'mongoose';
import Product from '../../models/Product.js';

// 추천 상품 순서 변경
export const reorderRecommendedProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    console.log('추천 상품 순서 변경 요청:', { productIds });

    // 1. 유효성 검증
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ 
        message: '유효하지 않은 상품 ID 배열입니다.',
        receivedData: { productIds }
      });
    }

    // 2. 모든 상품 ID가 유효하고, 추천 상품인지 확인
    const validProducts = await Product.find({ 
      _id: { $in: productIds },
      isRecommended: true 
    });

    if (validProducts.length !== productIds.length) {
      return res.status(400).json({ 
        message: '존재하지 않거나 추천 상품이 아닌 항목이 포함되어 있습니다.',
        receivedCount: productIds.length,
        validCount: validProducts.length
      });
    }

    // 3. 트랜잭션 시작
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 4. 모든 추천 상품의 recommendedOrder를 새로운 순서로 업데이트
      for (let i = 0; i < productIds.length; i++) {
        await Product.findByIdAndUpdate(
          productIds[i],
          { recommendedOrder: i + 1 },
          { session }
        );
      }

      // 5. 트랜잭션 커밋
      await session.commitTransaction();

      console.log('추천 상품 순서 변경 성공:', {
        updatedCount: productIds.length,
        newOrder: productIds
      });

      res.json({
        message: '추천 상품 순서가 성공적으로 변경되었습니다.',
        updatedCount: productIds.length,
        newOrder: productIds
      });

    } catch (error) {
      // 6. 에러 시 트랜잭션 롤백
      await session.abortTransaction();
      console.error('추천 상품 순서 변경 트랜잭션 실패:', error);
      throw error;
    } finally {
      // 7. 세션 종료
      session.endSession();
    }

  } catch (error) {
    console.error('추천 상품 순서 변경 오류:', error);
    res.status(500).json({
      message: '서버 오류가 발생했습니다.',
      error: error.message // 개발 중에만 사용
    });
  }
};
