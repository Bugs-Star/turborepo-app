import { useState, useEffect } from "react";
import { productService, Product } from "@/lib/services";

interface UseProductDetailsFetchOptions {
  onSuccess?: (product: Product) => void;
  onError?: (error: string) => void;
}

export const useProductDetailsFetch = (
  productId: string,
  options: UseProductDetailsFetchOptions = {}
) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await productService.getProduct(productId);
        setProduct(response.product);
        options.onSuccess?.(response.product);
      } catch (err) {
        const errorMessage = "상품 정보를 불러오는데 실패했습니다.";
        setError(errorMessage);
        options.onError?.(errorMessage);
        console.error("상품 조회 오류:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, options.onSuccess, options.onError]);

  // 상품이 없을 때 에러 처리
  const finalError =
    error || (!loading && !product ? "상품을 찾을 수 없습니다." : null);

  return {
    product,
    loading,
    error: finalError,
  };
};
