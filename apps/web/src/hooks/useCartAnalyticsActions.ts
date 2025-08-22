import { useCallback } from "react";
import { CartItemUI } from "@/types/cart";
import { useAnalytics } from "./useAnalytics";

export const useCartAnalyticsActions = () => {
  const { trackCartView, trackCartRemove, trackOrderInitiate } = useAnalytics();

  const handleCartView = useCallback(
    (itemCount: number, totalAmount: number) => {
      // 장바구니 뷰 로깅 (아이템 개수와 총 금액 포함)
      trackCartView(itemCount, totalAmount);
    },
    [trackCartView]
  );

  const handleCartRemove = useCallback(
    (item: CartItemUI) => {
      // 장바구니에서 상품 제거 로깅
      trackCartRemove(item);
    },
    [trackCartRemove]
  );

  const handleOrderInitiate = useCallback(
    (totalAmount: number, itemCount: number, paymentMethod?: string) => {
      trackOrderInitiate(totalAmount, itemCount, paymentMethod);
    },
    [trackOrderInitiate]
  );

  return {
    handleCartView,
    handleCartRemove,
    handleOrderInitiate,
  };
};
