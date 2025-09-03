import { useState, useEffect, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useInfiniteProductFetch } from "./useInfiniteProductFetch";
import { productService } from "@/lib/services";
import type { Product, ProductCategory } from "@/types/product";

interface UseHybridProductFetchParams {
  category: ProductCategory;
  pageSize?: number;
}

interface UseHybridProductFetchReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  fetchNextPage?: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

export const useHybridProductFetch = ({
  category,
  pageSize = 10,
}: UseHybridProductFetchParams): UseHybridProductFetchReturn => {
  const queryClient = useQueryClient();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);

  // 1단계: 기존 방식으로 첫 카테고리 빠르게 로드
  const {
    products: initialProducts,
    loading: initialLoading,
    error: initialError,
    refetch: initialRefetch,
    fetchNextPage: initialFetchNextPage,
    hasNextPage: initialHasNextPage,
    isFetchingNextPage: initialIsFetchingNextPage,
  } = useInfiniteProductFetch({
    category,
    pageSize,
  });

  // 2단계: 백그라운드에서 전체 데이터 로드
  const loadAllProducts = useCallback(async () => {
    if (isFullyLoaded) return;

    try {
      const response = await productService.getProducts({
        limit: 100,
      });

      setAllProducts(response.products);
      setIsFullyLoaded(true);
    } catch (error) {
      console.log("전체 데이터 로드 실패 (기존 방식으로 fallback):", error);
    }
  }, [isFullyLoaded]);

  // 백그라운드 로드 실행
  useEffect(() => {
    if (!initialLoading && initialProducts.length > 0 && !isFullyLoaded) {
      const timer = setTimeout(loadAllProducts, 1500);
      return () => clearTimeout(timer);
    }
  }, [initialLoading, initialProducts, isFullyLoaded, loadAllProducts]);

  // 3단계: 카테고리별 필터링
  const filteredProducts = useMemo(() => {
    if (isFullyLoaded && allProducts.length > 0) {
      return allProducts.filter((product) => product.category === category);
    }
    return initialProducts;
  }, [isFullyLoaded, allProducts, category, initialProducts]);

  // 4단계: 로딩 상태 최적화
  const loading = initialLoading && !isFullyLoaded;
  const error = initialError;
  const refetch = initialRefetch;

  // 5단계: 무한 스크롤 처리
  const fetchNextPage = useCallback(() => {
    if (isFullyLoaded) {
      return;
    }
    initialFetchNextPage?.();
  }, [isFullyLoaded, initialFetchNextPage]);

  const hasNextPage = isFullyLoaded ? false : initialHasNextPage;
  const isFetchingNextPage = isFullyLoaded ? false : initialIsFetchingNextPage;

  return {
    products: filteredProducts,
    loading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};
