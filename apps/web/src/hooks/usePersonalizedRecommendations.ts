import { useQuery } from "@tanstack/react-query";
import { productService } from "@/lib/services";
import { useAuthStore } from "@/stores/authStore";
import { PersonalizedRecommendation, PersonalizedRecommendationsResponse } from "@/types/product";

interface UsePersonalizedRecommendationsOptions {
  limit?: number;
  includeDetails?: boolean;
  enabled?: boolean;
}

interface UsePersonalizedRecommendationsReturn {
  data: PersonalizedRecommendation[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  type: 'personalized' | 'fallback' | null;
}

export const usePersonalizedRecommendations = (
  options: UsePersonalizedRecommendationsOptions = {}
): UsePersonalizedRecommendationsReturn => {
  const { limit = 5, includeDetails = true, enabled = true } = options;
  const { isAuthenticated } = useAuthStore();

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["personalizedRecommendations", limit, includeDetails],
    queryFn: async (): Promise<PersonalizedRecommendationsResponse> => {
      return await productService.getPersonalizedRecommendations({
        limit,
        includeDetails,
      });
    },
    enabled: enabled && isAuthenticated, // 인증된 사용자만 개인화 추천 요청
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    retry: (failureCount, error: any) => {
      // 인증 오류(401, 403)는 재시도하지 않음
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2; // 최대 2회 재시도
    },
  });

  return {
    data: response?.data?.recommendations || null,
    isLoading,
    error: error?.message || null,
    refetch,
    type: response?.data?.type || null,
  };
};
