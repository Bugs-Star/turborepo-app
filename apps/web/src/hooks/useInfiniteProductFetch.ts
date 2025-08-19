import { useInfiniteQuery } from "@tanstack/react-query";
import { productService, ProductsResponse } from "@/lib";

interface UseInfiniteProductFetchParams {
  category?: string;
  pageSize?: number;
}

export const useInfiniteProductFetch = (
  params?: UseInfiniteProductFetchParams
) => {
  const { category, pageSize = 10 } = params || {};

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["infiniteProducts", category],
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<ProductsResponse> => {
      return await productService.getProducts({
        category,
        page: pageParam as number,
        limit: pageSize,
      });
    },
    getNextPageParam: (lastPage: ProductsResponse) => {
      if (!lastPage.pagination) return undefined;

      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  // 모든 페이지의 상품들을 하나의 배열로 합치기
  const products =
    data?.pages.flatMap((page: ProductsResponse) => page.products) || [];

  // 현재 페이지 정보
  const currentPage = data?.pages.length || 0;
  const totalPages = data?.pages[0]?.pagination?.totalPages || 0;
  const totalItems = data?.pages[0]?.pagination?.totalItems || 0;

  return {
    products,
    loading: isLoading,
    error: error?.message || null,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    currentPage,
    totalPages,
    totalItems,
  };
};
