import { useQuery } from "@tanstack/react-query";
import { productService, ProductsResponse } from "@/lib";

interface UseProductFetchParams {
  category?: string;
  page?: number;
  limit?: number;
}

export const useProductFetch = (params?: UseProductFetchParams) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["products", params],
    queryFn: async (): Promise<ProductsResponse> => {
      return await productService.getProducts(params);
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  return {
    products: data?.products || [],
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
};
