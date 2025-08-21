import { useProducts } from "./useProducts";

export const useRecommendedMenuFetch = () => {
  const result = useProducts({
    isRecommended: true,
    mode: "list",
    pageSize: 10,
  });

  return {
    data: { products: result.data?.products || [] },
    isLoading: result.isLoading,
    error: result.error?.message || null,
    refetch: result.refetch,
  };
};
