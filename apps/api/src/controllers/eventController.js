import Event from '../models/Event.js';
import { compressMulterFile } from '../utils/imageUtils.js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import mongoose from 'mongoose'; // Added for reorderEvents

// 이벤트 등록
export const createEvent = async (req, res) => {
  try {
    console.log('이벤트 등록 요청:', {
      body: req.body,
      files: req.files,
      file: req.file
    });

    // Form-data와 JSON 모두 처리 (배열이 아닌 문자열로 처리)
    const getFieldValue = (fieldName) => {
      const value = req.body?.[fieldName];
      if (Array.isArray(value)) {
        return value[0]; // 배열의 첫 번째 요소
      }
      return value; // 단일 값
    };

    const title = getFieldValue('title');
    const description = getFieldValue('description');
    const startDate = getFieldValue('startDate');
    const endDate = getFieldValue('endDate');
    const isActive = getFieldValue('isActive');
    const eventOrder = getFieldValue('eventOrder');

    // 필수 필드 검증
    if (!title || !description || !startDate || !endDate) {
      return res.status(400).json({ 
        message: '필수 필드가 누락되었습니다. (title, description, startDate, endDate)',
        receivedData: {
          title: title,
          description: description?.substring(0, 30) + '...',
          startDate: startDate,
          endDate: endDate
        }
      });
    }

    // 날짜 유효성 검증
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ 
        message: '유효하지 않은 날짜 형식입니다. (ISO 8601 형식: YYYY-MM-DDTHH:mm:ss.sssZ)' 
      });
    }
    
    if (start >= end) {
      return res.status(400).json({ 
        message: '종료 날짜는 시작 날짜보다 늦어야 합니다.',
        receivedDates: {
          startDate: startDate,
          endDate: endDate
        }
      });
    }

    // 현재 로그인한 관리자 ID
    const adminId = req.admin._id;

    // 이벤트 이미지 처리 (압축 + Base64)
    let processedEventImg = null;

    const imageFile = req.files?.eventImg?.[0] || req.file;
    if (imageFile) {
      try {
        console.log('이벤트 이미지 압축 시작...');
        
        const compressionResult = await compressMulterFile(
          imageFile, 
          { maxWidth: 1200, maxHeight: 400, quality: 85 }, 
          'event-image'
        );

        console.log('이벤트 이미지 압축 완료:', {
          원본크기: `${compressionResult.original.sizeKB}KB`,
          압축크기: `${compressionResult.compressed.sizeKB}KB`,
          압축률: `${compressionResult.compressionRatio}%`,
          절약공간: `${Math.round(compressionResult.savedSpace / 1024 * 100) / 100}KB`
        });

        processedEventImg = compressionResult.compressed.base64;
        
      } catch (compressionError) {
        console.error('이벤트 이미지 압축 실패:', compressionError);
        return res.status(400).json({ message: '이미지 압축에 실패했습니다.' });
      }
    }

    if (!processedEventImg) {
      return res.status(400).json({ message: '이벤트 이미지가 필요합니다.' });
    }

    // 데이터 타입 변환
    const eventData = {
      adminId: adminId,
      title,
      description,
      eventImg: processedEventImg,
      startDate: start,
      endDate: end,
      isActive: isActive === 'true' || isActive === true || isActive === undefined,
      eventOrder: Number(eventOrder) || 0
    };

    const event = new Event(eventData);
    await event.save();

    console.log('이벤트 등록 성공:', event._id);

    res.status(201).json({
      message: '이벤트가 성공적으로 등록되었습니다.'
    });
  } catch (error) {
    console.error('이벤트 등록 오류:', error);
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error.message // 개발 중에만 사용
    });
  }
};

// 이벤트 목록 조회 (공통 - 관리자/일반 사용자)
export const getEvents = async (req, res) => {
  try {
    // 만료된 이벤트 자동 비활성화
    await Event.deactivateExpiredEvents();

    const { isActive, current, page = 1, limit = 5 } = req.query;

    // 쿼리 조건 구성
    const query = {};

    if (current === 'true') {
      // 현재 진행 중인 이벤트만 조회
      const now = new Date();
      query.isActive = true;
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
    } else if (isActive !== undefined) {
      // 활성 상태 이벤트 조회 (날짜 조건 없음)
      query.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;

    const events = await Event.find(query)
      .select('-adminId') // 생성자 정보는 제외 (공통)
      .sort({ eventOrder: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(query);

    res.json({
      events,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};



// 특정 이벤트 조회 (공통 - 관리자/일반 사용자)
export const getEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .select('-adminId'); // 생성자 정보는 제외 (공통)

    if (!event) {
      return res.status(404).json({ message: '이벤트를 찾을 수 없습니다.' });
    }

    res.json({ event });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 이벤트 수정
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('이벤트 수정 요청:', {
      eventId: id,
      body: req.body,
      files: req.files,
      file: req.file
    });

    // Form-data와 JSON 모두 처리 (배열이 아닌 문자열로 처리)
    const getFieldValue = (fieldName) => {
      const value = req.body?.[fieldName];
      if (Array.isArray(value)) {
        return value[0]; // 배열의 첫 번째 요소
      }
      return value; // 단일 값
    };

    const updateData = {};

    // 업데이트할 필드들 추출
    const fields = ['title', 'description', 'startDate', 'endDate', 'isActive', 'eventOrder'];

    fields.forEach(field => {
      const value = getFieldValue(field);
      if (value !== undefined && value !== '') {
        updateData[field] = value;
      }
    });

    // 이벤트 조회
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: '이벤트를 찾을 수 없습니다.' });
    }

    // 날짜 유효성 검증 (startDate나 endDate가 변경되는 경우)
    if (updateData.startDate || updateData.endDate) {
      const start = updateData.startDate ? new Date(updateData.startDate) : event.startDate;
      const end = updateData.endDate ? new Date(updateData.endDate) : event.endDate;
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ 
          message: '유효하지 않은 날짜 형식입니다. (ISO 8601 형식: YYYY-MM-DDTHH:mm:ss.sssZ)' 
        });
      }
      
      if (start >= end) {
        return res.status(400).json({ 
          message: '종료 날짜는 시작 날짜보다 늦어야 합니다.',
          receivedDates: {
            startDate: updateData.startDate || event.startDate,
            endDate: updateData.endDate || event.endDate
          }
        });
      }
    }

    // 이벤트 이미지 업데이트 (압축 + Base64)
    const imageFile = req.files?.eventImg?.[0] || req.file;
    if (imageFile) {
      try {
        console.log('이벤트 이미지 압축 시작...');
        
        const compressionResult = await compressMulterFile(
          imageFile, 
          { maxWidth: 1200, maxHeight: 400, quality: 85 }, 
          'event-image'
        );

        console.log('이벤트 이미지 압축 완료:', {
          원본크기: `${compressionResult.original.sizeKB}KB`,
          압축크기: `${compressionResult.compressed.sizeKB}KB`,
          압축률: `${compressionResult.compressionRatio}%`,
          절약공간: `${Math.round(compressionResult.savedSpace / 1024 * 100) / 100}KB`
        });

        updateData.eventImg = compressionResult.compressed.base64;
        
      } catch (compressionError) {
        console.error('이벤트 이미지 압축 실패:', compressionError);
        return res.status(400).json({ message: '이미지 압축에 실패했습니다.' });
      }
    }

    // 데이터 타입 변환
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }
    if (updateData.isActive !== undefined) {
      updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true;
    }
    if (updateData.eventOrder !== undefined) {
      updateData.eventOrder = Number(updateData.eventOrder);
    }

    // 업데이트할 데이터가 없으면 에러
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: '업데이트할 데이터가 없습니다.' });
    }

    // 이벤트 정보 업데이트
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('이벤트 수정 성공:', updatedEvent._id);

    res.json({
      message: '이벤트가 성공적으로 수정되었습니다.'
    });
  } catch (error) {
    console.error('이벤트 수정 오류:', error);
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error.message // 개발 중에만 사용
    });
  }
};

// 이벤트 삭제
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('이벤트 삭제 요청:', { eventId: id });

    // 이벤트 조회
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: '이벤트를 찾을 수 없습니다.' });
    }

    console.log('삭제할 이벤트 정보:', {
      eventId: event._id,
      title: event.title,
      adminId: event.adminId
    });

    // 이벤트 삭제
    await Event.findByIdAndDelete(id);

    console.log('이벤트 삭제 성공:', event._id);

    res.json({
      message: '이벤트가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('이벤트 삭제 오류:', error);
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error.message // 개발 중에만 사용
    });
  }
};



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