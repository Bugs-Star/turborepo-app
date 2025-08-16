import Product from '../models/Product.js';
import { compressMulterFile } from '../utils/imageUtils.js';

// 상품 등록
export const createProduct = async (req, res) => {
  try {
    console.log('요청 데이터 확인:', {
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

    const productCode = getFieldValue('productCode');
    const productName = getFieldValue('productName');
    const productImg = getFieldValue('productImg');
    const productContents = getFieldValue('productContents');
    const category = getFieldValue('category');
    const price = getFieldValue('price');
    const currentStock = getFieldValue('currentStock');
    const optimalStock = getFieldValue('optimalStock');
    const isRecommended = getFieldValue('isRecommended');
    const recommendedOrder = getFieldValue('recommendedOrder');

    // 이미지 파일 처리
    const imageFile = req.files?.productImg?.[0] || req.file;

    console.log('상품 등록 요청:', {
      productCode: productCode,
      productName: productName,
      productContents: productContents?.substring(0, 50) + '...',
      category: category,
      price: price,
      hasImage: !!imageFile,
      bodyKeys: Object.keys(req.body || {}),
      filesKeys: req.files ? Object.keys(req.files) : 'no files'
    });

    // 필수 필드 검증
    if (!productCode || !productName || !productContents || !category || !price) {
      return res.status(400).json({ 
        message: '필수 필드가 누락되었습니다. (productCode, productName, productContents, category, price)',
        receivedData: {
          productCode: productCode,
          productName: productName,
          productContents: productContents?.substring(0, 30) + '...',
          category: category,
          price: price
        }
      });
    }

    // 현재 로그인한 관리자 ID
    const adminId = req.admin._id;

    // productCode 중복 확인
    const existingProduct = await Product.findOne({ productCode: productCode.toUpperCase() });
    if (existingProduct) {
      return res.status(400).json({ message: '중복된 메뉴 코드 입니다.' });
    }

    let processedImage = productImg;

    // 이미지 파일이 업로드된 경우 압축 처리
    if (imageFile) {
      try {
        console.log('상품 이미지 압축 시작...');
        
        const compressionResult = await compressMulterFile(
          imageFile, 
          { maxWidth: 800, maxHeight: 600, quality: 80 }, 
          'product'
        );

        console.log('상품 이미지 압축 완료:', {
          원본크기: `${compressionResult.original.sizeKB}KB`,
          압축크기: `${compressionResult.compressed.sizeKB}KB`,
          압축률: `${compressionResult.compressionRatio}%`,
          절약공간: `${Math.round(compressionResult.savedSpace / 1024 * 100) / 100}KB`
        });

        processedImage = compressionResult.compressed.base64;
        
      } catch (compressionError) {
        console.error('상품 이미지 압축 실패:', compressionError);
        return res.status(400).json({ message: '이미지 압축에 실패했습니다.' });
      }
    } else {
      // 이미지가 없는 경우 에러
      return res.status(400).json({ message: '상품 이미지가 필요합니다.' });
    }

    const product = new Product({
      createdBy: adminId,
      productCode: productCode.toUpperCase(),
      productName,
      productImg: processedImage,
      productContents,
      category,
      price: Number(price),
      currentStock: Number(currentStock) || 0,
      optimalStock: Number(optimalStock),
      isRecommended: isRecommended === 'true' || isRecommended === true,
      recommendedOrder: Number(recommendedOrder) || 0
    });

    await product.save();

    console.log('상품 등록 성공:', product._id);

    res.status(201).json({
      message: '상품이 성공적으로 등록되었습니다.'
    });
  } catch (error) {
    console.error('상품 등록 오류:', error);
    
    // MongoDB unique constraint 에러 처리
    if (error.code === 11000 && error.keyPattern && error.keyPattern.productCode) {
      return res.status(400).json({ message: '중복된 메뉴 코드 입니다.' });
    }
    
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error.message // 개발 중에만 사용
    });
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

    // 이미지 파일이 업로드된 경우 압축 처리
    if (req.file) {
      try {
        console.log('이미지 압축 시작...');
        
        // 임시 파일 생성
        const tempDir = os.tmpdir();
        const tempFilePath = path.join(tempDir, `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`);
        
        // 메모리에서 임시 파일로 저장
        fs.writeFileSync(tempFilePath, req.file.buffer);
        
        const compressionResult = await compressMulterFile(
          req.file, 
          { maxWidth: 800, maxHeight: 600, quality: 80 }, 
          'product'
        );

        console.log('이미지 압축 완료:', {
          원본크기: `${compressionResult.original.sizeKB}KB`,
          압축크기: `${compressionResult.compressed.sizeKB}KB`,
          압축률: `${compressionResult.compressionRatio}%`
        });

        updateData.productImg = compressionResult.compressed.base64;
        
      } catch (compressionError) {
        console.error('이미지 압축 실패:', compressionError);
        return res.status(400).json({ message: '이미지 압축에 실패했습니다.' });
      }
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