import Product from '../models/Product.js';

// 상품 등록
export const createProduct = async (req, res) => {
  try {
    const {
      productCode,
      productName,
      productImg,
      productContents,
      category,
      price,
      currentStock,
      optimalStock,
      isRecommended,
      recommendedOrder
    } = req.body;

    // 현재 로그인한 관리자 ID
    const adminId = req.admin._id;

    // productCode 중복 확인
    const existingProduct = await Product.findOne({ productCode: productCode.toUpperCase() });
    if (existingProduct) {
      return res.status(400).json({ message: '중복된 메뉴 코드 입니다.' });
    }

    const product = new Product({
      createdBy: adminId,
      productCode: productCode.toUpperCase(),
      productName,
      productImg,
      productContents,
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
    // MongoDB unique constraint 에러 처리
    if (error.code === 11000 && error.keyPattern && error.keyPattern.productCode) {
      return res.status(400).json({ message: '중복된 메뉴 코드 입니다.' });
    }
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
      .select('-createdBy') // 생성자 정보는 제외 (공통)
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
      .select('-createdBy'); // 생성자 정보는 제외 (공통)

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
    const updateData = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }

    // productCode 변경 시 중복 확인
    if (updateData.productCode && updateData.productCode !== product.productCode) {
      const existingProduct = await Product.findOne({ 
        productCode: updateData.productCode.toUpperCase(),
        _id: { $ne: id } // 현재 상품 제외
      });
      if (existingProduct) {
        return res.status(400).json({ message: '중복된 메뉴 코드 입니다.' });
      }
      updateData.productCode = updateData.productCode.toUpperCase();
    }

    // 업데이트 가능한 필드들
    const allowedFields = [
      'productCode', 'productName', 'productImg', 'productContents', 'category', 'price',
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
    // MongoDB unique constraint 에러 처리
    if (error.code === 11000 && error.keyPattern && error.keyPattern.productCode) {
      return res.status(400).json({ message: '중복된 메뉴 코드 입니다.' });
    }
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 상품 삭제
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

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
    .select('-createdBy') // 생성자 정보는 제외 (공통)
    .sort({ recommendedOrder: 1, createdAt: -1 });

    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};


