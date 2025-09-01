import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Product, ProductCategory } from "@/types";
import { useAnalytics } from "./useAnalytics";

export const useMenuActions = () => {
  const router = useRouter();
  const { trackProductClick, trackCategoryClick } = useAnalytics();

  const handleProductClick = useCallback(
    (product: Product, activeCategory: string) => {
      // 로거 호출
      trackProductClick(product, "menu_product_grid");
      router.push(`/menu/${product._id}?category=${activeCategory}`);
    },
    [trackProductClick, router]
  );

  const handleCategoryChange = useCallback(
    (
      category: ProductCategory,
      previousCategory?: ProductCategory,
      onCategoryChange?: (category: ProductCategory) => void
    ) => {
      // 로거 호출
      trackCategoryClick(category);

      // 기존 카테고리 변경 로직 실행
      onCategoryChange?.(category);
    },
    [trackCategoryClick]
  );

  return {
    handleProductClick,
    handleCategoryChange,
  };
};
