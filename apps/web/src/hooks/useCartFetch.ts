import { useQuery } from "@tanstack/react-query";
import { cartService } from "@/lib/services";
import { tokenManager } from "@/lib/api";

export interface CartItem {
  _id: string;
  productId: string;
  quantity: number;
  product: {
    _id: string;
    productName: string;
    productImg: string;
    price: number;
    category: string;
  };
  subtotal: number;
  isAvailable: boolean;
  stockStatus: string;
}

export interface CartSummary {
  totalAmount: number;
  totalItems: number;
  itemCount: number;
  availableItems: number;
  outOfStockItems: number;
}

export interface CartResponse {
  cart: CartItem[];
  summary: CartSummary;
}

export const useCartFetch = () => {
  return useQuery<CartResponse>({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await cartService.getCart();
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
    // 토큰이 있을 때만 쿼리 활성화
    enabled: tokenManager.hasTokens(),
    // 401 에러는 재시도하지 않음
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
    // 에러 시 기본값 반환
    throwOnError: false,
  });
};
