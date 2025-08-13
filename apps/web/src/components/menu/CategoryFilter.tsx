import { useState, useMemo } from "react";
import { Product } from "@/lib";

interface CategoryFilterProps {
  products: Product[];
  onCategoryChange?: (category: string) => void;
  children: (filteredProducts: Product[]) => React.ReactNode;
}

export default function CategoryFilter({
  products,
  onCategoryChange,
  children,
}: CategoryFilterProps) {
  const [activeCategory, setActiveCategory] = useState("beverage");

  // 카테고리 매핑
  const categoryMapping = {
    beverage: "음료",
    food: "푸드",
    product: "상품",
  };

  const categories = Object.keys(categoryMapping);

  // 필터링된 상품들
  const filteredProducts = useMemo(() => {
    return products.filter((product) => product.category === activeCategory);
  }, [products, activeCategory]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    onCategoryChange?.(category);
  };

  return (
    <>
      {/* Category Navigation */}
      <div className="flex justify-center space-x-8 mb-6">
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
      {children(filteredProducts)}
    </>
  );
}

// 훅으로도 사용할 수 있도록 export
export const useCategoryFilter = (products: Product[]) => {
  const [activeCategory, setActiveCategory] = useState("beverage");

  const categoryMapping = {
    beverage: "음료",
    food: "푸드",
    product: "상품",
  };

  const categories = Object.keys(categoryMapping);

  const filteredProducts = useMemo(() => {
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
