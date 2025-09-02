import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { compressMulterFile } from '../utils/imageUtils.js';

// 상품 등록
export const createProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
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
      await session.abortTransaction();
      session.endSession();
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

    // category 값 검증
    const validCategories = ['beverage', 'food', 'goods'];
    if (!validCategories.includes(category)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: '유효하지 않은 카테고리입니다. (beverage, food, goods 중 하나를 선택해주세요)',
        receivedCategory: category,
        validCategories: validCategories
      });
    }

    // 현재 로그인한 관리자 ID
    const adminId = req.admin._id;

    // productCode 중복 확인
    const existingProduct = await Product.findOne({ productCode: productCode.toUpperCase() }).session(session);
    if (existingProduct) {
      await session.abortTransaction();
      session.endSession();
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
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: '이미지 압축에 실패했습니다.' });
      }
    } else {
      // 이미지가 없는 경우 에러
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: '상품 이미지가 필요합니다.' });
    }

    const isRecommendedBool = isRecommended === 'true' || isRecommended === true;
    let recommendedOrder = 0;

    if (isRecommendedBool) {
      // 추천 상품일 경우, 기존 추천 상품들의 순서를 1씩 증가시킴
      await Product.updateMany({ isRecommended: true }, { $inc: { recommendedOrder: 1 } }, { session });
      recommendedOrder = 1; // 새로운 추천 상품은 최상단(1번)으로
    }

    const product = new Product({
      adminId: adminId,
      productCode: productCode.toUpperCase(),
      productName,
      productImg: processedImage,
      productContents,
      category,
      price: Number(price),
      currentStock: Number(currentStock) || 0,
      optimalStock: Number(optimalStock),
      isRecommended: isRecommendedBool,
      recommendedOrder: recommendedOrder
    });

    await product.save({ session });

    await session.commitTransaction();
    session.endSession();

    console.log('상품 등록 성공:', product._id);

    res.status(201).json({
      message: '상품이 성공적으로 등록되었습니다.'
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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

    // 정렬 옵션 설정
    let sortOption = { createdAt: -1 };
    if (isRecommended === 'true') {
      // 추천 상품일 때는 recommendedOrder로 정렬
      sortOption = { recommendedOrder: 1, createdAt: -1 };
    }

    const products = await Product.find(query)
      .select('-adminId') // 관리자 정보는 제외 (공통)
      .sort(sortOption)
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
  const { id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('상품 수정 요청:', {
      productId: id,
      body: req.body,
      files: req.files,
      file: req.file
    });

    const getFieldValue = (fieldName) => {
      const value = req.body?.[fieldName];
      return Array.isArray(value) ? value[0] : value;
    };

    const updateData = {};
    const fields = [
      'productCode', 'productName', 'productContents', 'category', 'price',
      'currentStock', 'optimalStock', 'isRecommended', 'recommendedOrder'
    ];

    fields.forEach(field => {
      const value = getFieldValue(field);
      if (value !== undefined && value !== '') {
        updateData[field] = value;
      }
    });

    const product = await Product.findById(id).session(session);
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }

    if (updateData.productCode && updateData.productCode !== product.productCode) {
      const existingProduct = await Product.findOne({ 
        productCode: updateData.productCode.toUpperCase(),
        _id: { $ne: id } 
      }).session(session);
      if (existingProduct) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: '중복된 메뉴 코드 입니다.' });
      }
      updateData.productCode = updateData.productCode.toUpperCase();
    }

    if (updateData.category) {
      const validCategories = ['beverage', 'food', 'goods'];
      if (!validCategories.includes(updateData.category)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: '유효하지 않은 카테고리입니다.' });
      }
    }

    const imageFile = req.files?.productImg?.[0] || req.file;
    if (imageFile) {
      try {
        const compressionResult = await compressMulterFile(imageFile, { maxWidth: 800, maxHeight: 600, quality: 80 }, 'product');
        updateData.productImg = compressionResult.compressed.base64;
      } catch (compressionError) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: '이미지 압축에 실패했습니다.' });
      }
    }

    // isRecommended 상태 변경 감지 및 순서 조정
    if (updateData.isRecommended !== undefined) {
      const newIsRecommended = (updateData.isRecommended === 'true' || updateData.isRecommended === true);
      const oldIsRecommended = product.isRecommended;

      if (newIsRecommended && !oldIsRecommended) {
        // false -> true: 추천 상품으로 설정
        await Product.updateMany({ isRecommended: true }, { $inc: { recommendedOrder: 1 } }, { session });
        updateData.recommendedOrder = 1;
      } else if (!newIsRecommended && oldIsRecommended) {
        // true -> false: 추천 상품에서 제외
        const oldOrder = product.recommendedOrder;
        await Product.updateMany({ isRecommended: true, recommendedOrder: { $gt: oldOrder } }, { $inc: { recommendedOrder: -1 } }, { session });
        updateData.recommendedOrder = 0;
      }
    }
    
    // 데이터 타입 변환
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.currentStock !== undefined) updateData.currentStock = Number(updateData.currentStock);
    if (updateData.optimalStock) updateData.optimalStock = Number(updateData.optimalStock);
    if (updateData.isRecommended !== undefined) updateData.isRecommended = (updateData.isRecommended === 'true' || updateData.isRecommended === true);
    if (updateData.recommendedOrder !== undefined) updateData.recommendedOrder = Number(updateData.recommendedOrder);

    if (Object.keys(updateData).length === 0 && !imageFile) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: '업데이트할 데이터가 없습니다.' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true, session });

    await session.commitTransaction();
    session.endSession();

    console.log('상품 수정 성공:', updatedProduct._id);
    res.json({ message: '상품이 성공적으로 수정되었습니다.' });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('상품 수정 오류:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: '중복된 메뉴 코드 입니다.' });
    }
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
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

// 추천 상품 순서 변경
export const reorderRecommendedProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    console.log('추천 상품 순서 변경 요청:', { productIds });

    // 1. 유효성 검증
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ 
        message: '유효하지 않은 상품 ID 배열입니다.',
        receivedData: { productIds }
      });
    }

    // 2. 모든 상품 ID가 유효하고, 추천 상품인지 확인
    const validProducts = await Product.find({ 
      _id: { $in: productIds },
      isRecommended: true 
    });

    if (validProducts.length !== productIds.length) {
      return res.status(400).json({ 
        message: '존재하지 않거나 추천 상품이 아닌 항목이 포함되어 있습니다.',
        receivedCount: productIds.length,
        validCount: validProducts.length
      });
    }

    // 3. 트랜잭션 시작
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 4. 모든 추천 상품의 recommendedOrder를 새로운 순서로 업데이트
      for (let i = 0; i < productIds.length; i++) {
        await Product.findByIdAndUpdate(
          productIds[i],
          { recommendedOrder: i + 1 },
          { session }
        );
      }

      // 5. 트랜잭션 커밋
      await session.commitTransaction();

      console.log('추천 상품 순서 변경 성공:', {
        updatedCount: productIds.length,
        newOrder: productIds
      });

      res.json({
        message: '추천 상품 순서가 성공적으로 변경되었습니다.',
        updatedCount: productIds.length,
        newOrder: productIds
      });

    } catch (error) {
      // 6. 에러 시 트랜잭션 롤백
      await session.abortTransaction();
      console.error('추천 상품 순서 변경 트랜잭션 실패:', error);
      throw error;
    } finally {
      // 7. 세션 종료
      session.endSession();
    }

  } catch (error) {
    console.error('추천 상품 순서 변경 오류:', error);
    res.status(500).json({
      message: '서버 오류가 발생했습니다.',
      error: error.message // 개발 중에만 사용
    });
  }
};

