// 이미지 URL 정규화 유틸리티
// 기존 fixImageUrl 로직을 개선하여 타입 안전성과 재사용성을 높임

/**
 * 이미지 URL을 정규화합니다.
 * @param url - 정규화할 이미지 URL
 * @returns 정규화된 이미지 URL
 */
export const normalizeImageUrl = (url: string): string => {
  if (!url) return "";

  // 상대 경로인 경우 API 서버의 완전한 URL로 변환
  if (url.startsWith("/uploads/")) {
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"}${url}`;
  }

  // localhost:3001인 경우 3002로 변경
  if (url.includes("localhost:3001")) {
    return url.replace("localhost:3001", "localhost:3002");
  }

  return url;
};

/**
 * 상품 이미지를 정규화합니다.
 * @param product - 이미지가 포함된 상품 객체
 * @returns 정규화된 이미지가 포함된 상품 객체
 */
export const normalizeProductImage = <T extends { productImg: string }>(
  product: T
): T => ({
  ...product,
  productImg: normalizeImageUrl(product.productImg),
});

/**
 * 상품 배열의 이미지들을 정규화합니다.
 * @param products - 이미지가 포함된 상품 배열
 * @returns 정규화된 이미지가 포함된 상품 배열
 */
export const normalizeProductsImage = <T extends { productImg: string }>(
  products: T[]
): T[] => products.map(normalizeProductImage);

/**
 * 이미지 로드 에러 처리를 위한 기본 이미지 URL을 반환합니다.
 * @returns 기본 이미지 URL
 */
export const getDefaultImageUrl = (): string => {
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3E이미지%3C/text%3E%3C/svg%3E";
};

/**
 * 이미지 로드 에러 핸들러를 생성합니다.
 * @returns 이미지 에러 핸들러 함수
 */
export const createImageErrorHandler = () => {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = getDefaultImageUrl();
  };
};
