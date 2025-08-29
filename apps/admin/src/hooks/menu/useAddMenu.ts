import { useState } from "react";
import { ProductsService, AddProductPayload } from "@/lib/products";

export const useAddMenu = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMenu = async (payload: AddProductPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ProductsService.addProduct(payload);
      setIsLoading(false);
      return data;
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.response?.data?.message || "상품 추가 실패");
      throw err;
    }
  };

  return { addMenu, isLoading, error };
};
