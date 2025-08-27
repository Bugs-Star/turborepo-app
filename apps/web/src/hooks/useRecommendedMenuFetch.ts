import { useProducts } from "./useProducts";

export const useRecommendedMenuFetch = () => {
  const result = useProducts({
    isRecommended: true,
    mode: "list",
    pageSize: 10,
  });

  // result.data가 ProductsResponse 타입인지 확인
  const products =
    "products" in (result.data || {})
      ? (result.data as any)?.products || []
      : [];

  return {
    data: { products },
    isLoading: result.isLoading,
    error: result.error?.message || null,
    refetch: result.refetch,
  };
};
