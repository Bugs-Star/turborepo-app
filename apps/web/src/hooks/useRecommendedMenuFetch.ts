import { useQuery } from "@tanstack/react-query";
import { productService } from "@/lib";

export const useRecommendedMenuFetch = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["recommended-menu"],
    queryFn: async () => {
      return await productService.getRecommendedProducts();
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  return {
    data,
    isLoading,
    error: error?.message || null,
    refetch,
  };
};
