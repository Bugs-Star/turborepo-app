/* ------------------------------------------------------------
 * File      : /controllers/reorder/promotionReorder.js
 * Brief     : 프로모션 순서 변경 컨트롤러
 * Author    : 노인영
 * Date      : 2025-09-10
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import mongoose from 'mongoose';
import Promotion from '../../models/Promotion.js';

// 프로모션 순서 변경
export const reorderPromotions = async (req, res) => {
  try {
    const { promotionIds } = req.body;

    console.log('프로모션 순서 변경 요청:', { promotionIds });

    // 1. 유효성 검증
    if (!Array.isArray(promotionIds) || promotionIds.length === 0) {
      return res.status(400).json({ 
        message: '유효하지 않은 프로모션 ID 배열입니다.',
        receivedData: { promotionIds }
      });
    }

    // 2. 모든 프로모션 ID가 유효한지 확인
    const validPromotions = await Promotion.find({ _id: { $in: promotionIds } });
    if (validPromotions.length !== promotionIds.length) {
      return res.status(400).json({ 
        message: '존재하지 않는 프로모션이 포함되어 있습니다.',
        receivedCount: promotionIds.length,
        validCount: validPromotions.length
      });
    }

    // 3. 트랜잭션 시작
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 4. 모든 프로모션의 promotionOrder를 새로운 순서로 업데이트
      for (let i = 0; i < promotionIds.length; i++) {
        await Promotion.findByIdAndUpdate(
          promotionIds[i],
          { promotionOrder: i + 1 },
          { session }
        );
      }

      // 5. 트랜잭션 커밋
      await session.commitTransaction();

      console.log('프로모션 순서 변경 성공:', {
        updatedCount: promotionIds.length,
        newOrder: promotionIds
      });

      res.json({
        message: '프로모션 순서가 성공적으로 변경되었습니다.',
        updatedCount: promotionIds.length,
        newOrder: promotionIds
      });

    } catch (error) {
      // 6. 에러 시 트랜잭션 롤백
      await session.abortTransaction();
      console.error('프로모션 순서 변경 트랜잭션 실패:', error);
      throw error;
    } finally {
      // 7. 세션 종료
      session.endSession();
    }

  } catch (error) {
    console.error('프로모션 순서 변경 오류:', error);
    res.status(500).json({
      message: '서버 오류가 발생했습니다.',
      error: error.message // 개발 중에만 사용
    });
  }
};
