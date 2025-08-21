import { useProducts } from "./useProducts";
import type { ProductsResponse } from "@/types/product";

interface UseInfiniteProductFetchParams {
  category?: string;
  pageSize?: number;
}

export const useInfiniteProductFetch = (
  params?: UseInfiniteProductFetchParams
) => {
  const { category, pageSize = 10 } = params || {};

  const result = useProducts({
    category,
    pageSize,
    mode: "infinite",
  });

  // 모든 페이지의 상품들을 하나의 배열로 합치기
  const products =
    result.data?.pages.flatMap((page: ProductsResponse) => page.products) || [];

  // 현재 페이지 정보
  const currentPage = result.data?.pages.length || 0;
  const totalPages = result.data?.pages[0]?.pagination?.totalPages || 0;
  const totalItems = result.data?.pages[0]?.pagination?.totalItems || 0;

  return {
    products,
    loading: result.isLoading,
    error: result.error?.message || null,
    fetchNextPage: result.fetchNextPage,
    hasNextPage: result.hasNextPage,
    isFetchingNextPage: result.isFetchingNextPage,
    refetch: result.refetch,
    currentPage,
    totalPages,
    totalItems,
  };
};
