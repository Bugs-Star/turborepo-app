import { QueryClient } from "@tanstack/react-query";
import { productService } from "@/lib/services";
import type { ProductCategory } from "@/types/product";

/**
 * 상품 관련 캐시 관리 유틸리티 함수들
 * React Query 캐시 관리를 위한 상품 특화 함수들
 */

/**
 * 상품 목록을 프리페치합니다
 */
export const prefetchProducts = (
  queryClient: QueryClient,
  options: {
    category?: string;
    isRecommended?: boolean;
    mode?: "list" | "infinite";
  } = {}
) => {
  const { category, isRecommended, mode = "list" } = options;

  if (mode === "infinite") {
    return queryClient.prefetchInfiniteQuery({
      queryKey: ["products", "infinite", category, isRecommended],
      queryFn: async ({ pageParam = 1 }) => {
        return await productService.getProducts({
          category,
          page: pageParam as number,
          limit: 10,
          isRecommended,
        });
      },
      initialPageParam: 1,
      staleTime: 5 * 60 * 1000,
    });
  }

  return queryClient.prefetchQuery({
    queryKey: ["products", "list", category, isRecommended],
    queryFn: () =>
      productService.getProducts({
        category,
        limit: 10,
        isRecommended,
      }),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * 특정 상품을 프리페치합니다
 */
export const prefetchProduct = (
  queryClient: QueryClient,
  productId: string
) => {
  return queryClient.prefetchQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const response = await productService.getProduct(productId);
      return response.product;
    },
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * 상품 캐시를 무효화합니다
 */
export const invalidateProductCache = (
  queryClient: QueryClient,
  options: {
    category?: string;
    productId?: string;
    type?: "list" | "infinite" | "detail" | "all";
  } = {}
) => {
  const { category, productId, type = "all" } = options;

  if (type === "all" || type === "list") {
    queryClient.invalidateQueries({
      queryKey: ["products", "list", category],
    });
  }

  if (type === "all" || type === "infinite") {
    queryClient.invalidateQueries({
      queryKey: ["products", "infinite", category],
    });
  }

  if (type === "all" || type === "detail") {
    if (productId) {
      queryClient.invalidateQueries({
        queryKey: ["product", productId],
      });
    } else {
      queryClient.invalidateQueries({
        queryKey: ["product"],
      });
    }
  }
};

/**
 * 모든 상품 관련 캐시를 무효화합니다
 */
export const invalidateAllProductCaches = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ["products"] });
  queryClient.invalidateQueries({ queryKey: ["product"] });
};

/**
 * 상품 캐시를 미리 워밍업합니다 (주요 카테고리들)
 */
export const warmupProductCaches = (queryClient: QueryClient) => {
  const categories: ProductCategory[] = ["beverage", "food", "goods"];

  // 각 카테고리별 상품 목록 프리페치
  categories.forEach((category) => {
    prefetchProducts(queryClient, { category, mode: "list" });
  });

  // 추천 상품 프리페치
  prefetchProducts(queryClient, { isRecommended: true, mode: "list" });
};

/**
 * 특정 카테고리의 캐시를 새로고침합니다
 */
export const refreshCategoryCache = (
  queryClient: QueryClient,
  category: string
) => {
  // 기존 캐시 무효화
  invalidateProductCache(queryClient, { category });

  // 새로운 데이터 프리페치
  prefetchProducts(queryClient, { category, mode: "list" });
  prefetchProducts(queryClient, { category, mode: "infinite" });
};

/**
 * 상품 생성/업데이트 후 관련 캐시를 업데이트합니다
 */
export const handleProductUpdate = (
  queryClient: QueryClient,
  productId: string,
  category?: string
) => {
  // 상품 상세 캐시 무효화
  invalidateProductCache(queryClient, {
    productId,
    type: "detail",
  });

  // 관련 카테고리 캐시 무효화
  if (category) {
    invalidateProductCache(queryClient, {
      category,
      type: "list",
    });
    invalidateProductCache(queryClient, {
      category,
      type: "infinite",
    });
  }

  // 추천 상품 캐시도 무효화 (상품이 추천 상품일 수 있음)
  invalidateProductCache(queryClient, {
    type: "list",
  });
};

/**
 * 상품 목록 캐시를 무효화합니다
 */
export const invalidateProductList = (
  queryClient: QueryClient,
  category?: string
) => {
  invalidateProductCache(queryClient, { category, type: "list" });
};

/**
 * 상품 상세 캐시를 무효화합니다
 */
export const invalidateProductDetail = (
  queryClient: QueryClient,
  productId: string
) => {
  invalidateProductCache(queryClient, { productId, type: "detail" });
};

/**
 * 무한 스크롤 상품 캐시를 무효화합니다
 */
export const invalidateProductInfinite = (
  queryClient: QueryClient,
  category?: string
) => {
  invalidateProductCache(queryClient, { category, type: "infinite" });
};

/**
 * 특정 상품의 캐시 데이터를 가져옵니다
 */
export const getProductCache = (
  queryClient: QueryClient,
  productId: string
) => {
  return queryClient.getQueryData(["product", productId]);
};

/**
 * 특정 카테고리의 상품 목록 캐시를 가져옵니다
 */
export const getProductListCache = (
  queryClient: QueryClient,
  category?: string,
  isRecommended?: boolean
) => {
  return queryClient.getQueryData([
    "products",
    "list",
    category,
    isRecommended,
  ]);
};

/**
 * 상품 캐시 데이터를 설정합니다
 */
export const setProductCache = (
  queryClient: QueryClient,
  productId: string,
  data: any
) => {
  return queryClient.setQueryData(["product", productId], data);
};

/**
 * 상품 목록 캐시 데이터를 설정합니다
 */
export const setProductListCache = (
  queryClient: QueryClient,
  category: string | undefined,
  isRecommended: boolean | undefined,
  data: any
) => {
  return queryClient.setQueryData(
    ["products", "list", category, isRecommended],
    data
  );
};

/**
 * 상품 캐시가 존재하는지 확인합니다
 */
export const hasProductCache = (
  queryClient: QueryClient,
  productId: string
): boolean => {
  return queryClient.getQueryData(["product", productId]) !== undefined;
};

/**
 * 상품 목록 캐시가 존재하는지 확인합니다
 */
export const hasProductListCache = (
  queryClient: QueryClient,
  category?: string,
  isRecommended?: boolean
): boolean => {
  return (
    queryClient.getQueryData(["products", "list", category, isRecommended]) !==
    undefined
  );
};

/**
 * 상품 캐시를 제거합니다
 */
export const removeProductCache = (
  queryClient: QueryClient,
  productId: string
) => {
  return queryClient.removeQueries({ queryKey: ["product", productId] });
};

/**
 * 상품 목록 캐시를 제거합니다
 */
export const removeProductListCache = (
  queryClient: QueryClient,
  category?: string,
  isRecommended?: boolean
) => {
  return queryClient.removeQueries({
    queryKey: ["products", "list", category, isRecommended],
  });
};

/**
 * 상품 캐시 상태를 확인합니다
 */
export const getProductCacheState = (
  queryClient: QueryClient,
  productId: string
) => {
  return queryClient.getQueryState(["product", productId]);
};

/**
 * 상품 목록 캐시 상태를 확인합니다
 */
export const getProductListCacheState = (
  queryClient: QueryClient,
  category?: string,
  isRecommended?: boolean
) => {
  return queryClient.getQueryState([
    "products",
    "list",
    category,
    isRecommended,
  ]);
};
