import { useCallback } from "react";
import { CartItemUI } from "@/types/cart";
import { useAnalytics } from "./useAnalytics";

export const useCartAnalyticsActions = () => {
  const { trackRemoveItem, trackCreateOrder } = useAnalytics();

  const handleCartView = useCallback(
    (itemCount: number, totalAmount: number) => {
      // 장바구니 뷰는 화면 조회로 처리되므로 별도 로깅 불필요
      // trackScreenView가 이미 호출됨
    },
    []
  );

  const handleCartRemove = useCallback(
    (item: CartItemUI) => {
      // 장바구니에서 상품 제거 로깅
      trackRemoveItem(item);
    },
    [trackRemoveItem]
  );

  const handleOrderInitiate = useCallback(
    (totalAmount: number, itemCount: number, paymentMethod?: string) => {
      trackCreateOrder(totalAmount, itemCount);
    },
    [trackCreateOrder]
  );

  return {
    handleCartView,
    handleCartRemove,
    handleOrderInitiate,
  };
};
