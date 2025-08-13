import Product from '../models/Product.js';

// 상품 등록
export const createProduct = async (req, res) => {
  try {
    const {
      productName,
      productImg,
      category,
      price,
      currentStock,
      optimalStock,
      isRecommended,
      recommendedOrder
    } = req.body;

    // 현재 로그인한 관리자 ID
    const adminId = req.admin._id;

    const product = new Product({
      managedIds: [{ adminId }],
      productName,
      productImg,
      category,
      price,
      currentStock: currentStock || 0,
      optimalStock,
      isRecommended: isRecommended || false,
      recommendedOrder: recommendedOrder || 0
    });

    await product.save();

    res.status(201).json({
      message: '상품이 성공적으로 등록되었습니다.'
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 상품 목록 조회 (공통 - 관리자/일반 사용자)
export const getProducts = async (req, res) => {
  try {
    const { category, isRecommended, page = 1, limit = 10 } = req.query;

    // 쿼리 조건 구성
    const query = {};

    if (category) {
      query.category = category;
    }

    if (isRecommended !== undefined) {
      query.isRecommended = isRecommended === 'true';
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .select('-managedIds') // 관리자 정보는 제외 (공통)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
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

// 특정 상품 조회 (공통 - 관리자/일반 사용자)
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .select('-managedIds'); // 관리자 정보는 제외 (공통)

    if (!product) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }

    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 상품 수정
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin._id;
    const updateData = req.body;

    const product = await Product.findOne({
      _id: id,
      'managedIds.adminId': adminId
    });

    if (!product) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }

    // 업데이트 가능한 필드들
    const allowedFields = [
      'productName', 'productImg', 'category', 'price',
      'currentStock', 'optimalStock', 'isRecommended', 'recommendedOrder'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        product[field] = updateData[field];
      }
    });

    await product.save();

    res.json({
      message: '상품이 성공적으로 수정되었습니다.'
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 상품 삭제
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin._id;

    const product = await Product.findOne({
      _id: id,
      'managedIds.adminId': adminId
    });

    if (!product) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }

    await Product.findByIdAndDelete(id);

    res.json({
      message: '상품이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 추천 상품 목록 조회 (공통 - 관리자/일반 사용자)
export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isRecommended: true
    })
    .select('-managedIds') // 관리자 정보는 제외 (공통)
    .sort({ recommendedOrder: 1, createdAt: -1 });

    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};


