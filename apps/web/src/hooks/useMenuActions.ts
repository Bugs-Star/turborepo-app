import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import { useAnalytics } from "./useAnalytics";

export const useMenuActions = () => {
  const router = useRouter();
  const { trackProductClick, trackFilterChange } = useAnalytics();

  const handleProductClick = useCallback(
    (product: Product, activeCategory: string) => {
      // 로거 호출
      trackProductClick(product, activeCategory);
      router.push(`/menu/${product._id}?category=${activeCategory}`);
    },
    [trackProductClick, router]
  );

  const handleCategoryChange = useCallback(
    (
      category: string,
      previousCategory?: string,
      onCategoryChange?: (category: string) => void
    ) => {
      // 로거 호출
      trackFilterChange(category, previousCategory);

      // 기존 카테고리 변경 로직 실행
      onCategoryChange?.(category);
    },
    [trackFilterChange]
  );

  return {
    handleProductClick,
    handleCategoryChange,
  };
};
