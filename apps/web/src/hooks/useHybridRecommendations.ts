import { useMemo } from "react";
import { usePersonalizedRecommendations } from "./usePersonalizedRecommendations";
import { useRecommendedMenuFetch } from "./useRecommendedMenuFetch";
import { useAuthStore } from "@/stores/authStore";
import type { Product } from "@/types/product";

interface HybridRecommendation {
  _id: string;
  productName: string;
  productImg: string;
  productCode?: string;
  price?: number;
  category?: string;
  recommendationScore?: number;
  recommendationRank?: number;
}

interface UseHybridRecommendationsOptions {
  limit?: number;
}

interface UseHybridRecommendationsReturn {
  data: { products: HybridRecommendation[] };
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  recommendationType: 'personalized' | 'fallback' | 'manual' | null;
}

/**
 * 하이브리드 추천 훅
 * 1. 인증된 사용자: 개인화 추천 API 시도 → 실패 시 수동 추천으로 폴백
 * 2. 비인증 사용자: 수동 추천 사용
 */
export const useHybridRecommendations = (
  options: UseHybridRecommendationsOptions = {}
): UseHybridRecommendationsReturn => {
  const { limit = 5 } = options;
  const { isAuthenticated } = useAuthStore();

  // 개인화 추천 (인증된 사용자만)
  const {
    data: personalizedData,
    isLoading: personalizedLoading,
    error: personalizedError,
    refetch: personalizedRefetch,
    type: personalizedType,
  } = usePersonalizedRecommendations({
    limit,
    enabled: isAuthenticated,
  });

  // 수동 추천 (폴백용)
  const {
    data: manualData,
    isLoading: manualLoading,
    error: manualError,
    refetch: manualRefetch,
  } = useRecommendedMenuFetch();

  // 결과 결정 로직
  const result = useMemo(() => {
    // 인증되지 않은 사용자는 수동 추천 사용
    if (!isAuthenticated) {
      return {
        data: { products: manualData?.products || [] },
        isLoading: manualLoading,
        error: manualError,
        refetch: manualRefetch,
        recommendationType: 'manual' as const,
      };
    }

    // 개인화 추천이 로딩 중인 경우
    if (personalizedLoading) {
      return {
        data: { products: [] },
        isLoading: true,
        error: null,
        refetch: personalizedRefetch,
        recommendationType: null,
      };
    }

    // 개인화 추천이 성공한 경우
    if (personalizedData && personalizedData.length > 0) {
      const hybridProducts: HybridRecommendation[] = personalizedData.map((item) => ({
        _id: item.productCode, // productCode를 _id로 사용
        productName: item.productName,
        productImg: item.productImg,
        productCode: item.productCode,
        recommendationScore: item.recommendationScore,
        recommendationRank: item.recommendationRank,
      }));

      return {
        data: { products: hybridProducts },
        isLoading: false,
        error: null,
        refetch: personalizedRefetch,
        recommendationType: personalizedType,
      };
    }

    // 개인화 추천이 실패했거나 결과가 없는 경우 → 수동 추천으로 폴백
    console.log('[HybridRecommendations] 개인화 추천 실패, 수동 추천으로 폴백');
    return {
      data: { products: manualData?.products || [] },
      isLoading: manualLoading,
      error: personalizedError || manualError,
      refetch: () => {
        personalizedRefetch();
        manualRefetch();
      },
      recommendationType: 'manual' as const,
    };
  }, [
    isAuthenticated,
    personalizedData,
    personalizedLoading,
    personalizedError,
    personalizedRefetch,
    personalizedType,
    manualData,
    manualLoading,
    manualError,
    manualRefetch,
  ]);

  return result;
};
