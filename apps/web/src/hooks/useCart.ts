import { cartService } from "@/lib/services";
import { useToast, useDelayedLoading } from "@/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { CartResponse } from "@/types";
import {
  updateCartResponse,
  removeItemFromCart,
  updateItemQuantity,
  updateBothCaches as updateBothCachesUtil,
  backupCacheState,
  invalidateAllCartCaches,
  rollbackAllCaches,
} from "@/utils";

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
    return updateBothCachesUtil(queryClient, updater);
  };

  const addToCart = async (
    productId: string,
    quantity: number,
    productInfo?: any
  ) => {
    if (isLoading) return;

    // 현재 캐시 상태 백업
    const previousState = backupCacheState(queryClient);

    // 낙관적 업데이트: 모든 캐시를 동시에 업데이트
    updateBothCaches((oldData) => {
      if (!oldData) return oldData;
      // 새로운 아이템을 추가하는 로직 (updateCartResponse 사용)
      const newItem = {
        _id: `temp_${Date.now()}`, // 임시 ID
        productId: productId,
        quantity: quantity,
        subtotal: productInfo ? productInfo.price * quantity : 0, // 실제 가격 사용
        product: productInfo || {
          _id: productId,
          productName: "로딩 중...",
          price: 0,
          category: "",
          description: "",
          image: "",
          isAvailable: true,
        },
        isAvailable: true,
        stockStatus: "available", // stockStatus 필드 추가
      };
      return updateCartResponse(oldData, [...oldData.cart, newItem]);
    });

    const cleanup = startDelayedLoading();

    try {
      await cartService.addToCart(productId, quantity);
      showToast("장바구니에 추가되었습니다.", "success");
      // 성공 시 캐시 무효화하여 최신 데이터 가져오기
      invalidateAllCartCaches(queryClient);
      options.onSuccess?.();
    } catch (err) {
      // 에러 발생 시 모든 캐시 롤백
      rollbackAllCaches(
        queryClient,
        previousState.cart,
        previousState.cartCount
      );
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
    const previousState = backupCacheState(queryClient);

    // 낙관적 업데이트: 모든 캐시를 동시에 업데이트
    updateBothCaches((oldData) => {
      if (!oldData) return oldData;
      return removeItemFromCart(oldData, itemId);
    });

    const cleanup = startDelayedLoading();

    try {
      await cartService.removeFromCart(itemId);
      showToast("장바구니에서 제거되었습니다.", "success");
      options.onSuccess?.();
    } catch (err) {
      // 에러 발생 시 모든 캐시 롤백
      rollbackAllCaches(
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
    const previousState = backupCacheState(queryClient);

    // 낙관적 업데이트: 모든 캐시를 동시에 업데이트
    updateBothCaches((oldData) => {
      if (!oldData) return oldData;
      return updateItemQuantity(oldData, itemId, quantity);
    });

    const cleanup = startDelayedLoading();

    try {
      await cartService.updateCartItemQuantity(itemId, quantity);
      // 수량 변경 성공 시에는 토스트 메시지 제거 (사용자 경험 개선)
      options.onSuccess?.();
    } catch (err) {
      // 에러 발생 시 모든 캐시 롤백
      rollbackAllCaches(
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
