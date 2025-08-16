import { useQuery } from "@tanstack/react-query";
import { productService } from "@/lib";

export const useRecommendedMenuFetch = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["recommended-menu"],
    queryFn: async () => {
      try {
        return await productService.getRecommendedProducts();
      } catch (error) {
        console.error("추천 메뉴를 가져오는데 실패했습니다:", error);
        // 에러 시 기본 데이터 반환
        return {
          products: [],
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    retry: 1, // 실패 시 1번만 재시도
    retryDelay: 1000, // 1초 후 재시도
  });

  return {
    data: data || { products: [] },
    isLoading,
    error: error?.message || null,
    refetch,
  };
};
