import Advertisement from '../models/Advertisement.js';

// 광고 등록
export const createAdvertisement = async (req, res) => {
  try {
    const {
      title,
      description,
      linkUrl,
      startDate,
      endDate,
      isActive,
      priority,
      targetAudience,
      displayLocation
    } = req.body;

    // 현재 로그인한 관리자 ID
    const adminId = req.admin._id;

    // 광고 이미지 처리
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!imageUrl) {
      return res.status(400).json({ message: '광고 이미지가 필요합니다.' });
    }

    const advertisement = new Advertisement({
      createdBy: adminId,
      title,
      description,
      imageUrl,
      linkUrl,
      startDate,
      endDate,
      isActive: isActive !== undefined ? isActive : true,
      priority: priority || 0,
      targetAudience: targetAudience || 'all',
      displayLocation: displayLocation || 'home'
    });

    await advertisement.save();

    res.status(201).json({
      message: '광고가 성공적으로 등록되었습니다.'
    });
  } catch (error) {
    console.error('광고 등록 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 광고 목록 조회 (공통 - 관리자/일반 사용자)
export const getAdvertisements = async (req, res) => {
  try {
    const { isActive, displayLocation, targetAudience, page = 1, limit = 10 } = req.query;

    // 쿼리 조건 구성
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (displayLocation) {
      query.displayLocation = displayLocation;
    }

    if (targetAudience) {
      query.targetAudience = targetAudience;
    }

    const skip = (page - 1) * limit;

    const advertisements = await Advertisement.find(query)
      .select('-createdBy') // 생성자 정보는 제외 (공통)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Advertisement.countDocuments(query);

    res.json({
      advertisements,
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

// 활성 광고 목록 조회 (공통 - 관리자/일반 사용자)
export const getActiveAdvertisements = async (req, res) => {
  try {
    const { displayLocation, targetAudience } = req.query;
    const now = new Date();
    
    const query = {
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    };

    if (displayLocation) {
      query.displayLocation = displayLocation;
    }

    if (targetAudience) {
      query.targetAudience = targetAudience;
    }
    
    const advertisements = await Advertisement.find(query)
      .select('-createdBy') // 생성자 정보는 제외 (공통)
      .sort({ priority: -1, createdAt: -1 });

    res.json({ advertisements });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 특정 광고 조회 (공통 - 관리자/일반 사용자)
export const getAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = await Advertisement.findById(id)
      .select('-createdBy'); // 생성자 정보는 제외 (공통)

    if (!advertisement) {
      return res.status(404).json({ message: '광고를 찾을 수 없습니다.' });
    }

    res.json({ advertisement });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 광고 수정
export const updateAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const advertisement = await Advertisement.findById(id);

    if (!advertisement) {
      return res.status(404).json({ message: '광고를 찾을 수 없습니다.' });
    }

    // 업데이트 가능한 필드들
    const allowedFields = [
      'title', 'description', 'linkUrl', 'startDate', 'endDate', 
      'isActive', 'priority', 'targetAudience', 'displayLocation'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        advertisement[field] = updateData[field];
      }
    });

    // 광고 이미지 업데이트
    if (req.file) {
      advertisement.imageUrl = `/uploads/${req.file.filename}`;
    }

    await advertisement.save();

    res.json({
      message: '광고가 성공적으로 수정되었습니다.'
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 광고 삭제
export const deleteAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = await Advertisement.findById(id);

    if (!advertisement) {
      return res.status(404).json({ message: '광고를 찾을 수 없습니다.' });
    }

    await Advertisement.findByIdAndDelete(id);

    res.json({
      message: '광고가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 관리자용 광고 목록 조회 (생성자 정보 포함)
export const getAdminAdvertisements = async (req, res) => {
  try {
    const { isActive, displayLocation, targetAudience, page = 1, limit = 10 } = req.query;

    // 쿼리 조건 구성
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (displayLocation) {
      query.displayLocation = displayLocation;
    }

    if (targetAudience) {
      query.targetAudience = targetAudience;
    }

    const skip = (page - 1) * limit;

    const advertisements = await Advertisement.find(query)
      .populate('createdBy', 'name email') // 생성자 정보 포함
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Advertisement.countDocuments(query);

    res.json({
      advertisements,
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

// 관리자용 특정 광고 조회 (생성자 정보 포함)
export const getAdminAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = await Advertisement.findById(id)
      .populate('createdBy', 'name email'); // 생성자 정보 포함

    if (!advertisement) {
      return res.status(404).json({ message: '광고를 찾을 수 없습니다.' });
    }

    res.json({ advertisement });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};
