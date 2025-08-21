import { QueryClient } from "@tanstack/react-query";
import { productService } from "@/lib/services";
import type { ProductCategory } from "@/types/product";

/**
 * 상품 관련 캐시 관리 유틸리티
 * 기존 CacheUtils와 병행하여 상품 특화 캐시 관리 제공
 */
export class ProductCacheUtils {
  /**
   * 상품 목록을 프리페치합니다
   */
  static prefetchProducts(
    queryClient: QueryClient,
    options: {
      category?: string;
      isRecommended?: boolean;
      mode?: "list" | "infinite";
    } = {}
  ) {
    const { category, isRecommended, mode = "list" } = options;

    if (mode === "infinite") {
      return queryClient.prefetchInfiniteQuery({
        queryKey: ["products", "infinite", category, isRecommended],
        queryFn: async ({ pageParam = 1 }) => {
          return await productService.getProducts({
            category,
            page: pageParam,
            limit: 10,
            isRecommended,
          });
        },
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
  }

  /**
   * 특정 상품을 프리페치합니다
   */
  static prefetchProduct(queryClient: QueryClient, productId: string) {
    return queryClient.prefetchQuery({
      queryKey: ["product", productId],
      queryFn: async () => {
        const response = await productService.getProduct(productId);
        return response.product;
      },
      staleTime: 10 * 60 * 1000,
    });
  }

  /**
   * 상품 캐시를 무효화합니다
   */
  static invalidateProductCache(
    queryClient: QueryClient,
    options: {
      category?: string;
      productId?: string;
      type?: "list" | "infinite" | "detail" | "all";
    } = {}
  ) {
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
  }

  /**
   * 모든 상품 관련 캐시를 무효화합니다
   */
  static invalidateAllProductCaches(queryClient: QueryClient) {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["product"] });
  }

  /**
   * 상품 캐시를 미리 워밍업합니다 (주요 카테고리들)
   */
  static warmupProductCaches(queryClient: QueryClient) {
    const categories: ProductCategory[] = ["beverage", "food", "goods"];

    // 각 카테고리별 상품 목록 프리페치
    categories.forEach((category) => {
      this.prefetchProducts(queryClient, { category, mode: "list" });
    });

    // 추천 상품 프리페치
    this.prefetchProducts(queryClient, { isRecommended: true, mode: "list" });
  }

  /**
   * 특정 카테고리의 캐시를 새로고침합니다
   */
  static refreshCategoryCache(queryClient: QueryClient, category: string) {
    // 기존 캐시 무효화
    this.invalidateProductCache(queryClient, { category });

    // 새로운 데이터 프리페치
    this.prefetchProducts(queryClient, { category, mode: "list" });
    this.prefetchProducts(queryClient, { category, mode: "infinite" });
  }

  /**
   * 상품 생성/업데이트 후 관련 캐시를 업데이트합니다
   */
  static handleProductUpdate(
    queryClient: QueryClient,
    productId: string,
    category?: string
  ) {
    // 상품 상세 캐시 무효화
    this.invalidateProductCache(queryClient, {
      productId,
      type: "detail",
    });

    // 관련 카테고리 캐시 무효화
    if (category) {
      this.invalidateProductCache(queryClient, {
        category,
        type: "list",
      });
      this.invalidateProductCache(queryClient, {
        category,
        type: "infinite",
      });
    }

    // 추천 상품 캐시도 무효화 (상품이 추천 상품일 수 있음)
    this.invalidateProductCache(queryClient, {
      type: "list",
    });
  }
}
