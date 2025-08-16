import Promotion from '../models/Promotion.js';
import { compressMulterFile } from '../utils/imageUtils.js';

// 프로모션 등록
export const createPromotion = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      position
    } = req.body;

    // 현재 로그인한 관리자 ID
    const adminId = req.admin._id;

    // 필수 필드 검증
    if (!title) {
      return res.status(400).json({ message: '제목이 필요합니다.' });
    }

    if (!description) {
      return res.status(400).json({ message: '설명이 필요합니다.' });
    }

    if (!startDate) {
      return res.status(400).json({ message: '시작 날짜가 필요합니다.' });
    }

    if (!endDate) {
      return res.status(400).json({ message: '종료 날짜가 필요합니다.' });
    }

    // 날짜 유효성 검증
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({ message: '종료 날짜는 시작 날짜보다 늦어야 합니다.' });
    }

    // position 값 검증
    const validPositions = ['up', 'down'];
    const validatedPosition = position && validPositions.includes(position) ? position : 'up';

    // 프로모션 이미지 처리 (압축 + Base64)
    let processedImageUrl = null;

    if (req.files && req.files.promotionImg) {
      try {
        console.log('프로모션 이미지 압축 시작...');
        
        const compressionResult = await compressMulterFile(
          req.files.promotionImg[0], 
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
    }

    if (!processedImageUrl) {
      return res.status(400).json({ message: '프로모션 이미지가 필요합니다.' });
    }

    const promotion = new Promotion({
      adminId: adminId,
      title,
      description,
      promotionImg: processedImageUrl, // Base64 문자열로 저장
      startDate: start,
      endDate: end,
      isActive: true,
      position: validatedPosition
    });

    await promotion.save();

    res.status(201).json({
      message: '프로모션이 성공적으로 등록되었습니다.'
    });
  } catch (error) {
    console.error('프로모션 등록 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 프로모션 목록 조회 (공통 - 관리자/일반 사용자)
export const getPromotions = async (req, res) => {
  try {
    const { isActive, page = 1, limit = 10 } = req.query;

    // 쿼리 조건 구성
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;

    const promotions = await Promotion.find(query)
      .select('-adminId') // 생성자 정보는 제외 (공통)
      .sort({ position: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Promotion.countDocuments(query);

    res.json({
      promotions,
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

// 활성 프로모션 목록 조회 (공통 - 관리자/일반 사용자)
export const getActivePromotions = async (req, res) => {
  try {
    const now = new Date();

    // 쿼리 조건 구성
    const query = {
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    };
    
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
    const updateData = req.body;

    const promotion = await Promotion.findById(id);

    if (!promotion) {
      return res.status(404).json({ message: '프로모션을 찾을 수 없습니다.' });
    }

    // 업데이트 가능한 필드들
    const allowedFields = [
      'title', 'description', 'startDate', 'endDate', 
      'isActive', 'position'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        promotion[field] = updateData[field];
      }
    });

    // 프로모션 이미지 업데이트 (압축 + Base64)
    if (req.files && req.files.promotionImg) {
      try {
        console.log('프로모션 이미지 압축 시작...');
        
        const compressionResult = await compressMulterFile(
          req.files.promotionImg[0], 
          { maxWidth: 1200, maxHeight: 400, quality: 85 }, 
          'promotion-image'
        );

        console.log('프로모션 이미지 압축 완료:', {
          원본크기: `${compressionResult.original.sizeKB}KB`,
          압축크기: `${compressionResult.compressed.sizeKB}KB`,
          압축률: `${compressionResult.compressionRatio}%`,
          절약공간: `${Math.round(compressionResult.savedSpace / 1024 * 100) / 100}KB`
        });

        promotion.promotionImg = compressionResult.compressed.base64;
        
      } catch (compressionError) {
        console.error('프로모션 이미지 압축 실패:', compressionError);
        return res.status(400).json({ message: '이미지 압축에 실패했습니다.' });
      }
    }

    await promotion.save();

    res.json({
      message: '프로모션이 성공적으로 수정되었습니다.'
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 프로모션 삭제
export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;

    const promotion = await Promotion.findById(id);

    if (!promotion) {
      return res.status(404).json({ message: '프로모션을 찾을 수 없습니다.' });
    }

    await Promotion.findByIdAndDelete(id);

    res.json({
      message: '프로모션이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 관리자용 프로모션 목록 조회 (생성자 정보 포함)
export const getAdminPromotions = async (req, res) => {
  try {
    const { isActive, page = 1, limit = 10 } = req.query;

    // 쿼리 조건 구성
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;

    const promotions = await Promotion.find(query)
      .populate('adminId', 'name email') // 생성자 정보 포함
      .sort({ position: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Promotion.countDocuments(query);

    res.json({
      promotions,
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

// 관리자용 특정 프로모션 조회 (생성자 정보 포함)
export const getAdminPromotion = async (req, res) => {
  try {
    const { id } = req.params;

    const promotion = await Promotion.findById(id)
      .populate('adminId', 'name email'); // 생성자 정보 포함

    if (!promotion) {
      return res.status(404).json({ message: '프로모션을 찾을 수 없습니다.' });
    }

    res.json({ promotion });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};
