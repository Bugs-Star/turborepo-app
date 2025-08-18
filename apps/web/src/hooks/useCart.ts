import { useState } from "react";
import { cartService } from "@/lib/services";
import { useToast } from "@/hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";

interface UseCartOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useCart = (options: UseCartOptions = {}) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const invalidateCartQueries = () => {
    // 장바구니 관련 모든 쿼리 무효화
    queryClient.invalidateQueries({ queryKey: ["cart"] });
    queryClient.invalidateQueries({ queryKey: ["cartCount"] });
  };

  const addToCart = async (productId: string, quantity: number) => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      await cartService.addToCart(productId, quantity);
      showToast("장바구니에 추가되었습니다.", "success");
      invalidateCartQueries();
      options.onSuccess?.();
    } catch (err) {
      const errorMessage = "장바구니 추가에 실패했습니다.";
      showToast(errorMessage, "error");
      options.onError?.(errorMessage);
      throw err; // 에러를 다시 던져서 호출자가 처리할 수 있도록
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      await cartService.removeFromCart(itemId);
      showToast("장바구니에서 제거되었습니다.", "success");
      invalidateCartQueries();
      options.onSuccess?.();
    } catch (err) {
      const errorMessage = "장바구니에서 제거하는데 실패했습니다.";
      showToast(errorMessage, "error");
      options.onError?.(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItemQuantity = async (itemId: string, quantity: number) => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      await cartService.updateCartItemQuantity(itemId, quantity);
      showToast("수량이 변경되었습니다.", "success");
      invalidateCartQueries();
      options.onSuccess?.();
    } catch (err) {
      const errorMessage = "수량 변경에 실패했습니다.";
      showToast(errorMessage, "error");
      options.onError?.(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    isLoading,
  };
};
