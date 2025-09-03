import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { productService } from "@/lib/services";
import { useProductErrorHandler } from "./useProductErrorHandler";
import type { Product } from "@/types/product";

interface UseProductDetailsFetchOptions {
  onSuccess?: (product: Product) => void;
  onError?: (error: string) => void;
}

export const useProductDetailsFetch = (
  productId: string,
  options: UseProductDetailsFetchOptions = {}
) => {
  const { handleProductDetailError } = useProductErrorHandler();

  const {
    data: product,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: async (): Promise<Product> => {
      if (!productId) {
        throw new Error("상품 ID가 필요합니다.");
      }

      try {
        const response = await productService.getProduct(productId);
        return response.product;
      } catch (error) {
        handleProductDetailError(error);
        throw error;
      }
    },
    enabled: !!productId, // productId가 있을 때만 쿼리 실행
    staleTime: 10 * 60 * 1000, // 10분간 데이터를 fresh로 유지 (상품 정보는 자주 변경되지 않음)
    gcTime: 30 * 60 * 1000, // 30분간 캐시 유지
    retry: 2, // 실패 시 2번 재시도
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프
  });

  // onSuccess 콜백 처리
  useEffect(() => {
    if (product && options.onSuccess) {
      options.onSuccess(product);
    }
  }, [product, options.onSuccess, options]);

  // onError 콜백 처리
  useEffect(() => {
    if (error && options.onError) {
      const errorMessage = "상품 정보를 불러오는데 실패했습니다.";
      options.onError(errorMessage);
      console.error("상품 조회 오류:", error);
    }
  }, [error, options.onError, options]);

  // 상품이 없을 때 에러 처리
  const finalError = error
    ? "상품 정보를 불러오는데 실패했습니다."
    : !loading && !product
      ? "상품을 찾을 수 없습니다."
      : null;

  return {
    product: product || null,
    loading,
    error: finalError,
    refetch,
  };
};
