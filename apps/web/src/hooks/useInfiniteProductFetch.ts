import { useProducts } from "./useProducts";
import type { ProductsResponse } from "@/types/product";
import type { InfiniteData } from "@tanstack/react-query";

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

  // InfiniteData 타입 가드
  const isInfiniteData = (
    data: any
  ): data is InfiniteData<ProductsResponse> => {
    return data && "pages" in data;
  };

  // 모든 페이지의 상품들을 하나의 배열로 합치기
  const products = isInfiniteData(result.data)
    ? result.data.pages.flatMap((page: ProductsResponse) => page.products)
    : [];

  // 현재 페이지 정보
  const currentPage = isInfiniteData(result.data)
    ? result.data.pages.length
    : 0;
  const totalPages = isInfiniteData(result.data)
    ? result.data.pages[0]?.pagination?.totalPages || 0
    : 0;
  const totalItems = isInfiniteData(result.data)
    ? result.data.pages[0]?.pagination?.totalItems || 0
    : 0;

  return {
    products,
    loading: result.isLoading,
    error: result.error?.message || null,
    fetchNextPage: "fetchNextPage" in result ? result.fetchNextPage : undefined,
    hasNextPage: "hasNextPage" in result ? result.hasNextPage : false,
    isFetchingNextPage:
      "isFetchingNextPage" in result ? result.isFetchingNextPage : false,
    refetch: result.refetch,
    currentPage,
    totalPages,
    totalItems,
  };
};
