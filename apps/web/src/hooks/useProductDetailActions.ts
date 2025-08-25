import { useCallback } from "react";
import { Product } from "@/types";
import { useAnalytics } from "./useAnalytics";

export const useProductDetailActions = () => {
  const { trackProductView, trackAddToCart } = useAnalytics();

  const handleProductView = useCallback(
    (product: Product) => {
      // 상품 상세 페이지 뷰 로깅
      trackProductView(product);
    },
    [trackProductView]
  );

  const handleCartAdd = useCallback(
    (product: Product, quantity: number) => {
      // 장바구니 추가 로깅
      trackAddToCart(product, quantity);
    },
    [trackAddToCart]
  );

  return {
    handleProductView,
    handleCartAdd,
  };
};
