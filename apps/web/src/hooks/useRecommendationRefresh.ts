import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/lib/services";
import { useAuthStore } from "@/stores/authStore";

interface UseRecommendationRefreshOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * 추천 갱신 훅
 * 주문 완료, 상품 구매 등 사용자 행동 변화 후 추천을 갱신할 때 사용
 */
export const useRecommendationRefresh = (options: UseRecommendationRefreshOptions = {}) => {
  const { onSuccess, onError } = options;
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        throw new Error("인증이 필요합니다.");
      }
      return await productService.refreshPersonalizedRecommendations();
    },
    onSuccess: (data) => {
      console.log('[RecommendationRefresh] 추천 갱신 성공:', data);
      
      // React Query 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["personalizedRecommendations"]
      });
      
      // 기존 추천 관련 쿼리도 무효화 (하이브리드 추천에서 사용)
      queryClient.invalidateQueries({
        queryKey: ["products", "list"]
      });

      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('[RecommendationRefresh] 추천 갱신 실패:', error);
      onError?.(error.message || "추천 갱신에 실패했습니다.");
    },
  });

  return {
    refreshRecommendations: mutation.mutate,
    isRefreshing: mutation.isPending,
    error: mutation.error?.message || null,
  };
};

/**
 * 백그라운드 추천 갱신 훅
 * 사용자에게 로딩 상태를 보여주지 않고 조용히 추천을 갱신
 */
export const useBackgroundRecommendationRefresh = () => {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const refreshInBackground = async () => {
    if (!isAuthenticated) {
      console.log('[BackgroundRefresh] 비인증 사용자, 추천 갱신 건너뜀');
      return;
    }

    try {
      console.log('[BackgroundRefresh] 백그라운드 추천 갱신 시작');
      
      // API 호출 (결과를 기다리지 않음)
      productService.refreshPersonalizedRecommendations()
        .then((result) => {
          console.log('[BackgroundRefresh] 추천 갱신 성공:', result);
          
          // 캐시 무효화
          queryClient.invalidateQueries({
            queryKey: ["personalizedRecommendations"]
          });
        })
        .catch((error) => {
          console.warn('[BackgroundRefresh] 추천 갱신 실패 (무시됨):', error.message);
        });
        
    } catch (error) {
      console.warn('[BackgroundRefresh] 추천 갱신 요청 실패 (무시됨):', error);
    }
  };

  return { refreshInBackground };
};
