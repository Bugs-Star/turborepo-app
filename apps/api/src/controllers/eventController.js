import Event from '../models/Event.js';
import { compressMulterFile } from '../utils/imageUtils.js';

// 이벤트 등록
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      isActive,
      priority
    } = req.body;

    // 현재 로그인한 관리자 ID
    const adminId = req.admin._id;

    // 이벤트 이미지 처리 (압축 + Base64)
    let processedEventImg = null;

    if (req.file) {
      try {
        console.log('이벤트 이미지 압축 시작...');
        
        const compressionResult = await compressMulterFile(
          req.file, 
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

    const event = new Event({
      createdBy: adminId,
      title,
      description,
      eventImg: processedEventImg, // Base64 문자열로 저장
      startDate,
      endDate,
      isActive: isActive !== undefined ? isActive : true,
      priority: priority || 0
    });

    await event.save();

    res.status(201).json({
      message: '이벤트가 성공적으로 등록되었습니다.'
    });
  } catch (error) {
    console.error('이벤트 등록 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 이벤트 목록 조회 (공통 - 관리자/일반 사용자)
export const getEvents = async (req, res) => {
  try {
    // 만료된 이벤트 자동 비활성화
    await Event.deactivateExpiredEvents();

    const { isActive, page = 1, limit = 10 } = req.query;

    // 쿼리 조건 구성
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;

    const events = await Event.find(query)
      .select('-createdBy') // 생성자 정보는 제외 (공통)
      .sort({ priority: -1, createdAt: -1 })
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

// 활성 이벤트 목록 조회 (공통 - 관리자/일반 사용자)
export const getActiveEvents = async (req, res) => {
  try {
    // 만료된 이벤트 자동 비활성화
    await Event.deactivateExpiredEvents();
    
    const now = new Date();
    
    const events = await Event.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
    .select('-createdBy') // 생성자 정보는 제외 (공통)
    .sort({ priority: -1, createdAt: -1 });

    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 특정 이벤트 조회 (공통 - 관리자/일반 사용자)
export const getEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .select('-createdBy'); // 생성자 정보는 제외 (공통)

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
    const updateData = req.body;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: '이벤트를 찾을 수 없습니다.' });
    }

    // 업데이트 가능한 필드들
    const allowedFields = [
      'title', 'description', 'startDate', 'endDate', 
      'isActive', 'priority'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        event[field] = updateData[field];
      }
    });

    // 이벤트 이미지 업데이트 (압축 + Base64)
    if (req.file) {
      try {
        console.log('이벤트 이미지 압축 시작...');
        
        // 임시 파일 생성
        const tempDir = os.tmpdir();
        const tempFilePath = path.join(tempDir, `event-image-update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`);
        
        // 메모리에서 임시 파일로 저장
        fs.writeFileSync(tempFilePath, req.file.buffer);
        
        // 이벤트 이미지용 압축 설정 사용
        const compressionResult = await compressMulterFile(
          req.file, 
          { maxWidth: 1200, maxHeight: 400, quality: 85 }, 
          'event-image'
        );

        console.log('이벤트 이미지 압축 완료:', {
          원본크기: `${compressionResult.original.sizeKB}KB`,
          압축크기: `${compressionResult.compressed.sizeKB}KB`,
          압축률: `${compressionResult.compressionRatio}%`,
          절약공간: `${Math.round(compressionResult.savedSpace / 1024 * 100) / 100}KB`
        });

        event.eventImg = compressionResult.compressed.base64;

        // 임시 파일 삭제
        fs.unlinkSync(tempFilePath);
        
      } catch (compressionError) {
        console.error('이벤트 이미지 압축 실패:', compressionError);
        return res.status(400).json({ message: '이미지 압축에 실패했습니다.' });
      }
    }

    await event.save();

    res.json({
      message: '이벤트가 성공적으로 수정되었습니다.'
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 이벤트 삭제
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: '이벤트를 찾을 수 없습니다.' });
    }

    await Event.findByIdAndDelete(id);

    res.json({
      message: '이벤트가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 관리자용 이벤트 목록 조회 (생성자 정보 포함)
export const getAdminEvents = async (req, res) => {
  try {
    const { isActive, page = 1, limit = 10 } = req.query;

    // 쿼리 조건 구성
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;

    const events = await Event.find(query)
      .populate('createdBy', 'name email') // 생성자 정보 포함
      .sort({ priority: -1, createdAt: -1 })
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