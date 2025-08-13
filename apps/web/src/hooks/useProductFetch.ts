import { useState, useEffect } from "react";
import { productService, Product } from "@/lib";

export const useProductFetch = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProducts();
      setProducts(response.products || []);
    } catch (err) {
      console.error("상품 데이터를 가져오는데 실패했습니다:", err);
      setError("상품 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
};
