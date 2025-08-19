import { useState, useMemo, useEffect } from "react";
import { Product } from "@/lib";

interface CategoryFilterProps {
  products: Product[];
  initialCategory?: string;
  onCategoryChange?: (category: string) => void;
  children: (
    filteredProducts: Product[],
    activeCategory: string
  ) => React.ReactNode;
}

export default function CategoryFilter({
  products,
  initialCategory = "beverage",
  onCategoryChange,
  children,
}: CategoryFilterProps) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  // 카테고리 매핑
  const categoryMapping = {
    beverage: "음료",
    food: "푸드",
    goods: "상품",
  };

  const categories = Object.keys(categoryMapping);

  // 필터링된 상품들 (무한 스크롤에서는 이미 필터링된 데이터가 전달됨)
  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) {
      return [];
    }
    // 무한 스크롤에서는 이미 카테고리별로 필터링된 데이터가 전달되므로
    // 추가 필터링이 필요하지 않음
    return products;
  }, [products]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    onCategoryChange?.(category);
  };

  // 초기 카테고리가 변경되면 activeCategory 업데이트
  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  return (
    <>
      {/* Category Navigation */}
      <div className="flex justify-center space-x-8 mb-6 pt-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`text-sm font-medium transition-colors cursor-pointer hover:text-gray-600 ${
              activeCategory === category ? "text-black" : "text-gray-400"
            }`}
          >
            {categoryMapping[category as keyof typeof categoryMapping]}
          </button>
        ))}
      </div>

      {/* Render children with filtered products */}
      {children(filteredProducts, activeCategory)}
    </>
  );
}

// 훅으로도 사용할 수 있도록 export
export const useCategoryFilter = (products: Product[]) => {
  const [activeCategory, setActiveCategory] = useState("beverage");

  const categoryMapping = {
    beverage: "음료",
    food: "푸드",
    goods: "상품",
  };

  const categories = Object.keys(categoryMapping);

  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) {
      return [];
    }
    return products.filter((product) => product.category === activeCategory);
  }, [products, activeCategory]);

  return {
    activeCategory,
    setActiveCategory,
    filteredProducts,
    categories,
    categoryMapping,
  };
};
