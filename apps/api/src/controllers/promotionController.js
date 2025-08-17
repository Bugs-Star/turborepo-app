import Promotion from '../models/Promotion.js';
import { compressMulterFile } from '../utils/imageUtils.js';

// 프로모션 등록
export const createPromotion = async (req, res) => {
  try {
    console.log('프로모션 등록 요청:', {
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
    const position = getFieldValue('position');

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

    // position 값 검증
    const validPositions = ['up', 'down'];
    const validatedPosition = position && validPositions.includes(position) ? position : 'up';

    // 현재 로그인한 관리자 ID
    const adminId = req.admin._id;

    // 프로모션 이미지 처리 (압축 + Base64)
    let processedImageUrl = null;

    const imageFile = req.files?.promotionImg?.[0] || req.file;
    if (imageFile) {
      try {
        console.log('프로모션 이미지 압축 시작...');
        
        const compressionResult = await compressMulterFile(
          imageFile, 
          { maxWidth: 1200, maxHeight: 400, quality: 85 }, 
          'promotion-image'
        );

        console.log('프로모션 이미지 압축 완료:', {
          원본크기: `${compressionResult.original.sizeKB}KB`,
          압축크기: `${compressionResult.compressed.sizeKB}KB`,
          압축률: `${compressionResult.compressionRatio}%`,
          절약공간: `${Math.round(compressionResult.savedSpace / 1024 * 100) / 100}KB`
        });

        processedImageUrl = compressionResult.compressed.base64;
        
      } catch (compressionError) {
        console.error('프로모션 이미지 압축 실패:', compressionError);
        return res.status(400).json({ message: '이미지 압축에 실패했습니다.' });
      }
    } else {
      console.log('이미지 파일이 없습니다.');
    }

    if (!processedImageUrl) {
      return res.status(400).json({ message: '프로모션 이미지가 필요합니다.' });
    }

    // 데이터 타입 변환
    const promotionData = {
      adminId: adminId,
      title,
      description,
      promotionImg: processedImageUrl,
      startDate: start,
      endDate: end,
      isActive: true,
      position: validatedPosition
    };

    const promotion = new Promotion(promotionData);
    await promotion.save();

    console.log('프로모션 등록 성공:', promotion._id);

    res.status(201).json({
      message: '프로모션이 성공적으로 등록되었습니다.'
    });
  } catch (error) {
    console.error('프로모션 등록 오류:', error);
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error.message // 개발 중에만 사용
    });
  }
};

// 프로모션 목록 조회 (공통 - 관리자/일반 사용자)
export const getPromotions = async (req, res) => {
  try {
    const { isActive, position } = req.query;

    // 쿼리 조건 구성
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (position) {
      // position 값 검증
      const validPositions = ['up', 'down'];
      if (!validPositions.includes(position)) {
        return res.status(400).json({ 
          message: '유효하지 않은 position 값입니다. (up, down 중 하나를 선택해주세요)',
          receivedPosition: position,
          validPositions: validPositions
        });
      }
      query.position = position;
    }

    const promotions = await Promotion.find(query)
      .select('-adminId') // 생성자 정보는 제외 (공통)
      .sort({ position: -1, createdAt: -1 });

    res.json({ promotions });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};



// 특정 프로모션 조회 (공통 - 관리자/일반 사용자)
export const getPromotion = async (req, res) => {
  try {
    const { id } = req.params;

    const promotion = await Promotion.findById(id)
      .select('-adminId'); // 생성자 정보는 제외 (공통)

    if (!promotion) {
      return res.status(404).json({ message: '프로모션을 찾을 수 없습니다.' });
    }

    res.json({ promotion });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 프로모션 수정
export const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('프로모션 수정 요청:', {
      promotionId: id,
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
    const fields = ['title', 'description', 'startDate', 'endDate', 'isActive', 'position'];

    fields.forEach(field => {
      const value = getFieldValue(field);
      if (value !== undefined && value !== '') {
        updateData[field] = value;
      }
    });

    // 프로모션 조회
    const promotion = await Promotion.findById(id);
    if (!promotion) {
      return res.status(404).json({ message: '프로모션을 찾을 수 없습니다.' });
    }

    // 날짜 유효성 검증 (startDate나 endDate가 변경되는 경우)
    if (updateData.startDate || updateData.endDate) {
      const start = updateData.startDate ? new Date(updateData.startDate) : promotion.startDate;
      const end = updateData.endDate ? new Date(updateData.endDate) : promotion.endDate;
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ 
          message: '유효하지 않은 날짜 형식입니다. (ISO 8601 형식: YYYY-MM-DDTHH:mm:ss.sssZ)' 
        });
      }
      
      if (start >= end) {
        return res.status(400).json({ 
          message: '종료 날짜는 시작 날짜보다 늦어야 합니다.',
          receivedDates: {
            startDate: updateData.startDate || promotion.startDate,
            endDate: updateData.endDate || promotion.endDate
          }
        });
      }
    }

    // position 값 검증
    if (updateData.position) {
      const validPositions = ['up', 'down'];
      if (!validPositions.includes(updateData.position)) {
        return res.status(400).json({ 
          message: '유효하지 않은 position 값입니다. (up, down 중 하나를 선택해주세요)',
          receivedPosition: updateData.position,
          validPositions: validPositions
        });
      }
    }

    // 프로모션 이미지 업데이트 (압축 + Base64)
    const imageFile = req.files?.promotionImg?.[0] || req.file;
    if (imageFile) {
      try {
        console.log('프로모션 이미지 압축 시작...');
        
        const compressionResult = await compressMulterFile(
          imageFile, 
          { maxWidth: 1200, maxHeight: 400, quality: 85 }, 
          'promotion-image'
        );

        console.log('프로모션 이미지 압축 완료:', {
          원본크기: `${compressionResult.original.sizeKB}KB`,
          압축크기: `${compressionResult.compressed.sizeKB}KB`,
          압축률: `${compressionResult.compressionRatio}%`,
          절약공간: `${Math.round(compressionResult.savedSpace / 1024 * 100) / 100}KB`
        });

        updateData.promotionImg = compressionResult.compressed.base64;
        
      } catch (compressionError) {
        console.error('프로모션 이미지 압축 실패:', compressionError);
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

    // 업데이트할 데이터가 없으면 에러
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: '업데이트할 데이터가 없습니다.' });
    }

    // 프로모션 정보 업데이트
    const updatedPromotion = await Promotion.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('프로모션 수정 성공:', updatedPromotion._id);

    res.json({
      message: '프로모션이 성공적으로 수정되었습니다.'
    });
  } catch (error) {
    console.error('프로모션 수정 오류:', error);
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error.message // 개발 중에만 사용
    });
  }
};

// 프로모션 삭제
export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('프로모션 삭제 요청:', { promotionId: id });

    const promotion = await Promotion.findById(id);

    if (!promotion) {
      return res.status(404).json({ message: '프로모션을 찾을 수 없습니다.' });
    }

    console.log('삭제할 프로모션 정보:', {
      promotionId: promotion._id,
      title: promotion.title,
      adminId: promotion.adminId
    });

    await Promotion.findByIdAndDelete(id);

    console.log('프로모션 삭제 성공:', promotion._id);

    res.json({
      message: '프로모션이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('프로모션 삭제 오류:', error);
    res.status(500).json({
      message: '서버 오류가 발생했습니다.',
      error: error.message // 개발 중에만 사용
    });
  }
};




