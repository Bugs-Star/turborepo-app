import { useQuery } from "@tanstack/react-query";
import { cartService } from "@/lib/services";
import { useAuthStore } from "@/stores/authStore";
import { AxiosErrorResponse } from "@/types";

export interface CartCountResponse {
  count: number;
}

export const useCartCountFetch = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery<CartCountResponse>({
    queryKey: ["cartCount"],
    queryFn: async () => {
      const response = await cartService.getCartCount();
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
    // 서버에서는 항상 비활성화, 클라이언트에서만 인증 상태 확인
    enabled: typeof window !== "undefined" && isAuthenticated,
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
};
