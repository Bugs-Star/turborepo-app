import { useQuery } from "@tanstack/react-query";
import { cartService } from "@/lib/services";
import { tokenManager } from "@/lib/api";
import { useState, useEffect } from "react";

export interface CartCountResponse {
  count: number;
}

export const useCartCountFetch = () => {
  const [isClient, setIsClient] = useState(false);
  const [hasTokens, setHasTokens] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setHasTokens(tokenManager.hasTokens());
  }, []);

  return useQuery<CartCountResponse>({
    queryKey: ["cartCount"],
    queryFn: async () => {
      const response = await cartService.getCartCount();
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
    // 클라이언트에서만 토큰 체크
    enabled: isClient && hasTokens,
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
