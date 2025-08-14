import Event from '../models/Event.js';

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

    // 배너 이미지 처리
    const bannerImg = req.file ? `/uploads/${req.file.filename}` : null;

    if (!bannerImg) {
      return res.status(400).json({ message: '배너 이미지가 필요합니다.' });
    }

    const event = new Event({
      createdBy: adminId,
      title,
      description,
      bannerImg,
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

    // 배너 이미지 업데이트
    if (req.file) {
      event.bannerImg = `/uploads/${req.file.filename}`;
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

// 관리자용 특정 이벤트 조회 (생성자 정보 포함)
export const getAdminEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .populate('createdBy', 'name email'); // 생성자 정보 포함

    if (!event) {
      return res.status(404).json({ message: '이벤트를 찾을 수 없습니다.' });
    }

    res.json({ event });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};
