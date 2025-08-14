import multer from 'multer';

// 파일 필터링
const fileFilter = (req, file, cb) => {
  // 이미지 파일만 허용
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('이미지 파일만 업로드 가능합니다.'), false);
  }
};

// 기본 multer 설정
const baseMulter = multer({
  storage: multer.memoryStorage(), // 메모리에 임시 저장
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB 제한 (압축 전 원본 크기)
  }
});

// 단일 파일 업로드 (프로필 이미지용)
export const uploadSingle = baseMulter.single('profileImg');

// 다중 필드 업로드 (상품, 이벤트, 프로모션용)
export const uploadFields = baseMulter.fields([
  { name: 'productImg', maxCount: 1 },
  { name: 'eventImg', maxCount: 1 },
  { name: 'imageUrl', maxCount: 1 },
  { name: 'productCode', maxCount: 1 },
  { name: 'productName', maxCount: 1 },
  { name: 'productContents', maxCount: 1 },
  { name: 'category', maxCount: 1 },
  { name: 'price', maxCount: 1 },
  { name: 'currentStock', maxCount: 1 },
  { name: 'optimalStock', maxCount: 1 },
  { name: 'isRecommended', maxCount: 1 },
  { name: 'recommendedOrder', maxCount: 1 },
  { name: 'title', maxCount: 1 },
  { name: 'description', maxCount: 1 },
  { name: 'startDate', maxCount: 1 },
  { name: 'endDate', maxCount: 1 },
  { name: 'isActive', maxCount: 1 },
  { name: 'priority', maxCount: 1 },
  { name: 'linkUrl', maxCount: 1 },
  { name: 'targetAudience', maxCount: 1 },
  { name: 'displayLocation', maxCount: 1 }
]);

// 기본 export (다중 필드용)
export default uploadFields;
