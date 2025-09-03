import { useCallback } from "react";
import { Product } from "@/types";
import { useAnalytics } from "./useAnalytics";

export const useProductDetailActions = () => {
  const { trackAddToCart } = useAnalytics();

  const handleProductView = useCallback((product: Product) => {
    // 상품 상세 페이지 뷰 로깅은 trackScreenView에서 처리됨
    // 추가 로깅이 필요하면 여기에 구현
  }, []);

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
