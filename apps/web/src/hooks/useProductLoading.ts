import { useLoading } from "./useLoading";

// 상품 관련 로딩 컨텍스트 타입
export type ProductLoadingContext =
  | "products-list"
  | "product-detail"
  | "recommended-menu"
  | "product-search"
  | "product-filter"
  | "product-image";

/**
 * 상품 관련 로딩 상태를 관리하는 훅
 * 기존 useLoading을 확장하여 상품 특화 로딩 키 제공
 */
export const useProductLoading = (context: ProductLoadingContext) => {
  const loadingKey = `product-${context}`;
  return useLoading(loadingKey);
};

/**
 * 상품 목록 로딩 상태를 관리하는 훅
 */
export const useProductListLoading = () => {
  return useProductLoading("products-list");
};

/**
 * 상품 상세 로딩 상태를 관리하는 훅
 */
export const useProductDetailLoading = () => {
  return useProductLoading("product-detail");
};

/**
 * 추천 메뉴 로딩 상태를 관리하는 훅
 */
export const useRecommendedMenuLoading = () => {
  return useProductLoading("recommended-menu");
};

/**
 * 상품 이미지 로딩 상태를 관리하는 훅
 */
export const useProductImageLoading = () => {
  return useProductLoading("product-image");
};
