import { useCallback } from "react";
import { Product } from "@/types";
import { useAnalytics } from "./useAnalytics";

export const useProductDetailActions = () => {
  const { trackProductDetailView, trackCartAdd } = useAnalytics();

  const handleProductView = useCallback(
    (product: Product) => {
      // 상품 상세 페이지 뷰 로깅
      trackProductDetailView(product);
    },
    [trackProductDetailView]
  );

  const handleCartAdd = useCallback(
    (product: Product, quantity: number) => {
      // 장바구니 추가 로깅
      trackCartAdd(product, quantity);
    },
    [trackCartAdd]
  );

  return {
    handleProductView,
    handleCartAdd,
  };
};
