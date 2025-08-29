import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Product, ProductCategory } from "@/types/product";
import { CATEGORY_MAPPING, validateCategory } from "@/utils/categoryUtils";

interface CategoryFilterProps {
  products: Product[];
  initialCategory?: string; // 기존 호환성을 위해 string 유지
  onCategoryChange?: (category: ProductCategory) => void;
  onFilterChange?: (
    category: ProductCategory,
    previousCategory?: ProductCategory
  ) => void;
  children: (
    filteredProducts: Product[],
    activeCategory: ProductCategory
  ) => React.ReactNode;
}

// 타입 가드 함수
const isCategoryType = (value: unknown): value is ProductCategory => {
  return typeof value === "string" && value in CATEGORY_MAPPING;
};

export default function CategoryFilter({
  products,
  initialCategory = "beverage",
  onCategoryChange,
  onFilterChange,
  children,
}: CategoryFilterProps) {
  // 타입 검증을 통한 안전한 초기값 설정
  const validatedInitialCategory = validateCategory(initialCategory);
  const [activeCategory, setActiveCategory] = useState<ProductCategory>(
    validatedInitialCategory
  );
  const [underlineStyle, setUnderlineStyle] = useState({
    width: "0px",
    transform: "translateX(50%)", // 중앙에서 시작
  });
  const [isUnderlineReady, setIsUnderlineReady] = useState(false);

  const buttonRefs = useRef<{
    [key in ProductCategory]: HTMLButtonElement | null;
  }>({
    beverage: null,
    food: null,
    goods: null,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const categories: ProductCategory[] = Object.keys(
    CATEGORY_MAPPING
  ) as ProductCategory[];

  // 타입 안전한 필터링
  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) {
      return [];
    }

    // Product.category가 string이므로 타입 안전하게 필터링
    return products.filter((product) => {
      return (
        isCategoryType(product.category) && product.category === activeCategory
      );
    });
  }, [products, activeCategory]);

  const handleCategoryChange = useCallback(
    (category: ProductCategory) => {
      const previousCategory = activeCategory;
      setActiveCategory(category);
      onFilterChange?.(category, previousCategory);
      onCategoryChange?.(category);
    },
    [activeCategory, onFilterChange, onCategoryChange]
  );

  // 밑줄 위치 계산
  const updateUnderlinePosition = useCallback(() => {
    const activeButton = buttonRefs.current[activeCategory];
    const container = containerRef.current;

    if (activeButton && container) {
      const buttonRect = activeButton.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      setUnderlineStyle({
        width: `${buttonRect.width}px`,
        transform: `translateX(${buttonRect.left - containerRect.left}px)`,
      });
    }
  }, [activeCategory]);

  // 초기 카테고리 업데이트 (타입 검증 포함)
  useEffect(() => {
    const validatedCategory = validateCategory(initialCategory);
    setActiveCategory(validatedCategory);
  }, [initialCategory]);

  // 밑줄 위치 업데이트 (더 안전한 타이밍)
  useEffect(() => {
    const timer = setTimeout(updateUnderlinePosition, 100);
    return () => clearTimeout(timer);
  }, [updateUnderlinePosition]);

  // 초기 렌더링 후 밑줄 위치 계산 및 준비 완료
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUnderlinePosition();
      setIsUnderlineReady(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [updateUnderlinePosition]);

  return (
    <>
      {/* Category Navigation */}
      <div className="fixed top-18 left-1/2 transform -translate-x-1/2 w-full max-w-md z-45 bg-white">
        <div ref={containerRef} className="relative">
          <div className="flex justify-center space-x-4 py-2">
            {categories.map((category) => (
              <button
                key={category}
                ref={(el) => {
                  buttonRefs.current[category] = el;
                }}
                onClick={() => handleCategoryChange(category)}
                className={`text-sm font-medium transition-colors cursor-pointer hover:text-green-700 px-2 pb-0 ${
                  activeCategory === category
                    ? "text-green-800"
                    : "text-gray-400"
                }`}
              >
                {CATEGORY_MAPPING[category]}
              </button>
            ))}
          </div>

          {/* 애니메이션 밑줄 */}
          <div
            className={`absolute bottom-0 h-0.5 bg-green-800 transition-all duration-300 ease-in-out ${
              isUnderlineReady ? "opacity-100" : "opacity-0"
            }`}
            style={underlineStyle}
          />
        </div>
      </div>

      {/* Render children */}
      {children(filteredProducts, activeCategory)}
    </>
  );
}

// 훅으로도 사용할 수 있도록 export
export const useCategoryFilter = (products: Product[]) => {
  const [activeCategory, setActiveCategory] =
    useState<ProductCategory>("beverage");

  const categories: ProductCategory[] = Object.keys(
    CATEGORY_MAPPING
  ) as ProductCategory[];

  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) {
      return [];
    }
    return products.filter(
      (product) =>
        isCategoryType(product.category) && product.category === activeCategory
    );
  }, [products, activeCategory]);

  return {
    activeCategory,
    setActiveCategory,
    filteredProducts,
    categories,
    categoryMapping: CATEGORY_MAPPING,
  };
};
