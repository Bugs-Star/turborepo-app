import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { productService } from "@/lib/services";
import { useProductErrorHandler } from "./useProductErrorHandler";
import type { ProductQueryParams, ProductsResponse } from "@/types/product";

// 통합 상품 훅 옵션 인터페이스
interface UseProductsOptions extends ProductQueryParams {
  mode?: "list" | "infinite";
  enabled?: boolean;
}

/**
 * 통합된 상품 조회 훅
 * list와 infinite 모드를 모두 지원하며 기존 훅들과 호환되는 인터페이스 제공
 */
export const useProducts = (options: UseProductsOptions = {}) => {
  const {
    mode = "list",
    category,
    pageSize = 10,
    enabled = true,
    isRecommended,
    ...rest
  } = options;

  const { handleProductError } = useProductErrorHandler();

  // React Hook 규칙을 준수하기 위해 항상 두 Hook을 모두 호출
  const infiniteQuery = useInfiniteQuery({
    queryKey: ["products", "infinite", category, isRecommended],
    queryFn: async ({ pageParam }) => {
      try {
        return await productService.getProducts({
          category,
          page: pageParam,
          limit: pageSize,
          isRecommended,
          ...rest,
        });
      } catch (error) {
        handleProductError(error, "products-list");
        throw error;
      }
    },
    getNextPageParam: (lastPage: ProductsResponse) => {
      if (!lastPage.pagination) return undefined;
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: mode === "infinite" && enabled,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  const listQuery = useQuery({
    queryKey: ["products", "list", category, isRecommended, rest],
    queryFn: async () => {
      try {
        return await productService.getProducts({
          category,
          limit: pageSize,
          isRecommended,
          ...rest,
        });
      } catch (error) {
        handleProductError(error, "products-list");
        throw error;
      }
    },
    enabled: mode === "list" && enabled,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  // 모드에 따라 적절한 결과 반환
  return mode === "infinite" ? infiniteQuery : listQuery;
};
