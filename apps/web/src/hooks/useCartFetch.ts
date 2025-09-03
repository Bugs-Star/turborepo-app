import { useQuery } from "@tanstack/react-query";
import { cartService } from "@/lib/services";
import { useAuthStore } from "@/stores/authStore";
import { useState, useEffect } from "react";
import {
  CartResponse,
  CartItemUI,
  transformCartForUI,
  AxiosErrorResponse,
} from "@/types";

export const useCartFetch = () => {
  const [isClient, setIsClient] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const query = useQuery<CartResponse>({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await cartService.getCart();
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
    // 클라이언트에서만 인증 상태 체크
    enabled: isClient && isAuthenticated,
    // 401 에러는 재시도하지 않음
    retry: (failureCount, error: Error) => {
      if ((error as AxiosErrorResponse)?.response?.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
    // 에러 시 기본값 반환
    throwOnError: false,
  });

  // UI용 변환된 데이터 제공
  const cartItems: CartItemUI[] = query.data
    ? transformCartForUI(query.data).cart
    : [];

  // 요약 정보 제공
  const summary = query.data?.summary;

  return {
    ...query,
    cartItems,
    summary,
  };
};
