import { useRef } from "react";
import { cartService } from "@/lib/services";
import { useToast, useDelayedLoading } from "@/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { CartResponse } from "@/types/cart";
import { CartUtils, CacheUtils } from "@/utils";

interface UseCartOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useCart = (options: UseCartOptions = {}) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // 새로운 지연된 로딩 훅 사용
  const { isLoading, startDelayedLoading, stopDelayedLoading } =
    useDelayedLoading("cart", 300);

  const updateBothCaches = (
    updater: (oldData: CartResponse | undefined) => CartResponse | undefined
  ) => {
    return CacheUtils.updateBothCaches(queryClient, updater);
  };

  const addToCart = async (productId: string, quantity: number) => {
    if (isLoading) return;

    const cleanup = startDelayedLoading();

    try {
      await cartService.addToCart(productId, quantity);
      showToast("장바구니에 추가되었습니다.", "success");
      // 장바구니 추가는 전체 목록이 변경되므로 모든 캐시 무효화
      CacheUtils.invalidateAllCartCaches(queryClient);
      options.onSuccess?.();
    } catch (err) {
      const errorMessage = "장바구니 추가에 실패했습니다.";
      showToast(errorMessage, "error");
      options.onError?.(errorMessage);
      throw err; // 에러를 다시 던져서 호출자가 처리할 수 있도록
    } finally {
      cleanup(); // timeout 정리
      stopDelayedLoading();
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (isLoading) return;

    // 현재 캐시 상태 백업
    const previousState = CacheUtils.backupCacheState(queryClient);

    // 낙관적 업데이트: 모든 캐시를 동시에 업데이트
    updateBothCaches((oldData) => {
      if (!oldData) return oldData;
      return CartUtils.removeItemFromCart(oldData, itemId);
    });

    const cleanup = startDelayedLoading();

    try {
      await cartService.removeFromCart(itemId);
      showToast("장바구니에서 제거되었습니다.", "success");
      options.onSuccess?.();
    } catch (err) {
      // 에러 발생 시 모든 캐시 롤백
      CacheUtils.rollbackAllCaches(
        queryClient,
        previousState.cart,
        previousState.cartCount
      );
      const errorMessage = "장바구니에서 제거하는데 실패했습니다.";
      showToast(errorMessage, "error");
      options.onError?.(errorMessage);
      throw err;
    } finally {
      cleanup(); // timeout 정리
      stopDelayedLoading();
    }
  };

  const updateCartItemQuantity = async (itemId: string, quantity: number) => {
    if (isLoading) return;

    // 현재 캐시 상태 백업
    const previousState = CacheUtils.backupCacheState(queryClient);

    // 낙관적 업데이트: 모든 캐시를 동시에 업데이트
    updateBothCaches((oldData) => {
      if (!oldData) return oldData;
      return CartUtils.updateItemQuantity(oldData, itemId, quantity);
    });

    const cleanup = startDelayedLoading();

    try {
      await cartService.updateCartItemQuantity(itemId, quantity);
      showToast("수량이 변경되었습니다.", "success");
      options.onSuccess?.();
    } catch (err) {
      // 에러 발생 시 모든 캐시 롤백
      CacheUtils.rollbackAllCaches(
        queryClient,
        previousState.cart,
        previousState.cartCount
      );
      const errorMessage = "수량 변경에 실패했습니다.";
      showToast(errorMessage, "error");
      options.onError?.(errorMessage);
      throw err;
    } finally {
      cleanup(); // timeout 정리
      stopDelayedLoading();
    }
  };

  return {
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    isLoading,
  };
};
