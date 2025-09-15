/* ------------------------------------------------------------
 * File      : /controllers/reorder/eventReorder.js
 * Brief     : 이벤트 순서 변경 컨트롤러
 * Author    : 노인영
 * Date      : 2025-09-10
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import mongoose from 'mongoose';
import Event from '../../models/Event.js';

// 이벤트 순서 변경 (드래그 앤 드롭용)
export const reorderEvents = async (req, res) => {
  try {
    const { eventIds } = req.body;

    console.log('이벤트 순서 변경 요청:', { eventIds });

    // 1. 유효성 검증
    if (!Array.isArray(eventIds) || eventIds.length === 0) {
      return res.status(400).json({ 
        message: '유효하지 않은 이벤트 ID 배열입니다.',
        receivedData: { eventIds }
      });
    }

    // 2. 모든 이벤트 ID가 유효한지 확인
    const validEvents = await Event.find({ _id: { $in: eventIds } });
    if (validEvents.length !== eventIds.length) {
      return res.status(400).json({ 
        message: '존재하지 않는 이벤트가 포함되어 있습니다.',
        receivedCount: eventIds.length,
        validCount: validEvents.length
      });
    }

    // 3. 트랜잭션 시작
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 4. 모든 이벤트의 eventOrder를 새로운 순서로 업데이트
      for (let i = 0; i < eventIds.length; i++) {
        await Event.findByIdAndUpdate(
          eventIds[i],
          { eventOrder: i + 1 },
          { session }
        );
      }

      // 5. 트랜잭션 커밋
      await session.commitTransaction();

      console.log('이벤트 순서 변경 성공:', {
        updatedCount: eventIds.length,
        newOrder: eventIds
      });

      res.json({
        message: '이벤트 순서가 성공적으로 변경되었습니다.',
        updatedCount: eventIds.length,
        newOrder: eventIds
      });

    } catch (error) {
      // 6. 에러 시 트랜잭션 롤백
      await session.abortTransaction();
      console.error('이벤트 순서 변경 트랜잭션 실패:', error);
      throw error;
    } finally {
      // 7. 세션 종료
      session.endSession();
    }

  } catch (error) {
    console.error('이벤트 순서 변경 오류:', error);
    res.status(500).json({
      message: '서버 오류가 발생했습니다.',
      error: error.message // 개발 중에만 사용
    });
  }
};
