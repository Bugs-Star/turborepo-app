import { useState, useRef } from "react";
import { cartService } from "@/lib/services";
import { useToast } from "@/hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { CartResponse, CartItem } from "./useCartFetch";

interface UseCartOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useCart = (options: UseCartOptions = {}) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateCartCount = () => {
    // 장바구니 개수만 무효화 (GET /cart는 호출하지 않음)
    queryClient.invalidateQueries({ queryKey: ["cartCount"] });
  };

  const updateCartCache = (
    updater: (oldData: CartResponse | undefined) => CartResponse | undefined
  ) => {
    queryClient.setQueryData<CartResponse>(["cart"], updater);
  };

  const startDelayedLoading = () => {
    // 300ms 후에 로딩 표시 시작
    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoading(true);
    }, 300);
  };

  const stopLoading = () => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    setIsLoading(false);
  };

  const addToCart = async (productId: string, quantity: number) => {
    if (isLoading) return;

    startDelayedLoading();

    try {
      await cartService.addToCart(productId, quantity);
      showToast("장바구니에 추가되었습니다.", "success");
      // 장바구니 추가는 전체 목록이 변경되므로 무효화
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      updateCartCount();
      options.onSuccess?.();
    } catch (err) {
      const errorMessage = "장바구니 추가에 실패했습니다.";
      showToast(errorMessage, "error");
      options.onError?.(errorMessage);
      throw err; // 에러를 다시 던져서 호출자가 처리할 수 있도록
    } finally {
      stopLoading();
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (isLoading) return;

    // 낙관적 업데이트: UI를 먼저 업데이트
    const previousCart = queryClient.getQueryData<CartResponse>(["cart"]);

    if (previousCart) {
      updateCartCache((oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          cart: oldData.cart.filter((item) => item._id !== itemId),
          summary: {
            ...oldData.summary,
            totalItems: oldData.summary.totalItems - 1,
            totalAmount: oldData.cart
              .filter((item) => item._id !== itemId)
              .reduce((sum, item) => sum + item.subtotal, 0),
            itemCount: oldData.cart
              .filter((item) => item._id !== itemId)
              .reduce((sum, item) => sum + item.quantity, 0),
          },
        };
      });
    }

    startDelayedLoading();

    try {
      await cartService.removeFromCart(itemId);
      showToast("장바구니에서 제거되었습니다.", "success");
      updateCartCount();
      options.onSuccess?.();
    } catch (err) {
      // 에러 발생 시 이전 상태로 롤백
      if (previousCart) {
        queryClient.setQueryData<CartResponse>(["cart"], previousCart);
      }
      const errorMessage = "장바구니에서 제거하는데 실패했습니다.";
      showToast(errorMessage, "error");
      options.onError?.(errorMessage);
      throw err;
    } finally {
      stopLoading();
    }
  };

  const updateCartItemQuantity = async (itemId: string, quantity: number) => {
    if (isLoading) return;

    // 낙관적 업데이트: UI를 먼저 업데이트
    const previousCart = queryClient.getQueryData<CartResponse>(["cart"]);

    if (previousCart) {
      updateCartCache((oldData) => {
        if (!oldData) return oldData;

        const updatedCart = oldData.cart.map((item) =>
          item._id === itemId
            ? { ...item, quantity, subtotal: item.product.price * quantity }
            : item
        );

        return {
          ...oldData,
          cart: updatedCart,
          summary: {
            ...oldData.summary,
            totalAmount: updatedCart.reduce(
              (sum, item) => sum + item.subtotal,
              0
            ),
            itemCount: updatedCart.reduce(
              (sum, item) => sum + item.quantity,
              0
            ),
          },
        };
      });
    }

    startDelayedLoading();

    try {
      await cartService.updateCartItemQuantity(itemId, quantity);
      showToast("수량이 변경되었습니다.", "success");
      updateCartCount();
      options.onSuccess?.();
    } catch (err) {
      // 에러 발생 시 이전 상태로 롤백
      if (previousCart) {
        queryClient.setQueryData<CartResponse>(["cart"], previousCart);
      }
      const errorMessage = "수량 변경에 실패했습니다.";
      showToast(errorMessage, "error");
      options.onError?.(errorMessage);
      throw err;
    } finally {
      stopLoading();
    }
  };

  return {
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    isLoading,
  };
};
