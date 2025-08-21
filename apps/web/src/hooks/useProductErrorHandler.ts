import { useCallback } from "react";
import { useErrorHandler } from "./useErrorHandler";

// 상품 관련 에러 컨텍스트 타입
export type ProductErrorContext =
  | "products-list"
  | "product-detail"
  | "recommended-menu"
  | "product-search"
  | "product-filter";

// 상품 에러 메시지 매핑
const PRODUCT_ERROR_MESSAGES: Record<ProductErrorContext, string> = {
  "products-list": "상품 목록을 불러오는데 실패했습니다.",
  "product-detail": "상품 정보를 불러오는데 실패했습니다.",
  "recommended-menu": "추천 메뉴를 불러오는데 실패했습니다.",
  "product-search": "상품 검색에 실패했습니다.",
  "product-filter": "상품 필터링에 실패했습니다.",
};

/**
 * 상품 관련 에러 처리를 위한 훅
 * 기존 useErrorHandler를 확장하여 상품 특화 에러 처리 제공
 */
export const useProductErrorHandler = () => {
  const { handleError } = useErrorHandler();

  const handleProductError = useCallback(
    (error: any, context: ProductErrorContext, customMessage?: string) => {
      const defaultMessage = PRODUCT_ERROR_MESSAGES[context];
      const message = customMessage || defaultMessage;

      handleError(error, message);
    },
    [handleError]
  );

  const handleProductListError = useCallback(
    (error: any) => {
      handleProductError(error, "products-list");
    },
    [handleProductError]
  );

  const handleProductDetailError = useCallback(
    (error: any) => {
      handleProductError(error, "product-detail");
    },
    [handleProductError]
  );

  const handleRecommendedMenuError = useCallback(
    (error: any) => {
      handleProductError(error, "recommended-menu");
    },
    [handleProductError]
  );

  return {
    handleProductError,
    handleProductListError,
    handleProductDetailError,
    handleRecommendedMenuError,
  };
};
