import sharp from 'sharp';
import fs from 'fs';

/**
 * 이미지를 압축하고 Base64로 변환 (비율 유지)
 * @param {string} filePath - 원본 이미지 파일 경로
 * @param {Object} options - 압축 옵션
 * @returns {Promise<string>} Base64 문자열
 */
export const compressAndConvertToBase64 = async (filePath, options = {}) => {
  try {
    const {
      maxWidth = 800,        // 최대 너비
      maxHeight = 600,       // 최대 높이
      quality = 80,          // JPEG 품질 (1-100)
      format = 'jpeg'        // 출력 형식
    } = options;

    // 이미지 압축 및 리사이징 (비율 유지)
    const compressedBuffer = await sharp(filePath)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',       // 비율 유지하면서 크기 조정
        withoutEnlargement: true  // 원본보다 크게 하지 않음
      })
      .jpeg({ quality })     // JPEG 압축
      .toBuffer();

    // Base64로 변환
    const base64String = compressedBuffer.toString('base64');
    const mimeType = `image/${format}`;
    
    return `data:${mimeType};base64,${base64String}`;
  } catch (error) {
    console.error('이미지 압축 오류:', error);
    throw new Error('이미지 압축에 실패했습니다.');
  }
};

/**
 * 이미지 파일 정보 가져오기
 * @param {string} filePath - 이미지 파일 경로
 * @returns {Promise<Object>} 이미지 정보
 */
export const getImageInfo = async (filePath) => {
  try {
    const metadata = await sharp(filePath).metadata();
    const stats = fs.statSync(filePath);
    
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: stats.size, // bytes
      sizeKB: Math.round(stats.size / 1024 * 100) / 100
    };
  } catch (error) {
    console.error('이미지 정보 가져오기 오류:', error);
    throw new Error('이미지 정보를 가져올 수 없습니다.');
  }
};

/**
 * 이미지 압축 후 크기 비교
 * @param {string} filePath - 원본 이미지 파일 경로
 * @param {Object} options - 압축 옵션
 * @returns {Promise<Object>} 압축 전후 정보
 */
export const compressImageWithComparison = async (filePath, options = {}) => {
  try {
    // 원본 이미지 정보
    const originalInfo = await getImageInfo(filePath);
    
    // 압축된 Base64 생성
    const compressedBase64 = await compressAndConvertToBase64(filePath, options);
    
    // 압축된 크기 계산 (Base64에서 실제 크기 추출)
    const base64Data = compressedBase64.split(',')[1];
    const compressedSize = Math.round((base64Data.length * 3) / 4);
    const compressedSizeKB = Math.round(compressedSize / 1024 * 100) / 100;
    
    // 압축률 계산
    const compressionRatio = Math.round((1 - compressedSize / originalInfo.size) * 100);
    
    return {
      original: {
        size: originalInfo.size,
        sizeKB: originalInfo.sizeKB,
        width: originalInfo.width,
        height: originalInfo.height
      },
      compressed: {
        size: compressedSize,
        sizeKB: compressedSizeKB,
        base64: compressedBase64
      },
      compressionRatio,
      savedSpace: originalInfo.size - compressedSize
    };
  } catch (error) {
    console.error('이미지 압축 비교 오류:', error);
    throw error;
  }
};

/**
 * 다양한 용도별 압축 설정 (비율 유지)
 */
export const compressionPresets = {
  // 상품 이미지용 (가로 800px 또는 세로 600px 제한)
  product: {
    maxWidth: 800,
    maxHeight: 600,
    quality: 80,
    format: 'jpeg'
  },
  // 썸네일용 (가로 300px 또는 세로 300px 제한)
  thumbnail: {
    maxWidth: 300,
    maxHeight: 300,
    quality: 70,
    format: 'jpeg'
  },
  // 큰 상품 이미지용 (가로 1200px 또는 세로 800px 제한)
  productLarge: {
    maxWidth: 1200,
    maxHeight: 800,
    quality: 85,
    format: 'jpeg'
  },
  // 웹 최적화용 (가로 600px 또는 세로 400px 제한)
  web: {
    maxWidth: 600,
    maxHeight: 400,
    quality: 75,
    format: 'jpeg'
  },
  // 이벤트 배너용 (가로 1000px 또는 세로 500px 제한)
  banner: {
    maxWidth: 1000,
    maxHeight: 500,
    quality: 80,
    format: 'jpeg'
  }
};
