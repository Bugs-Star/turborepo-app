import { useQuery } from "@tanstack/react-query";
import { productService, Product } from "@/lib";

export const useProductFetch = () => {
  const {
    data: products = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const response = await productService.getProducts();
      return response.products || [];
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  return {
    products,
    loading,
    error: error?.message || null,
    refetch,
  };
};
