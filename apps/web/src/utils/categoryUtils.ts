import type { ProductCategory } from "@/types/product";

// 공통 카테고리 매핑
export const CATEGORY_MAPPING: Record<ProductCategory, string> = {
  beverage: "음료",
  food: "푸드",
  goods: "상품",
} as const;

// 타입 안전한 카테고리 검증 함수
export const validateCategory = (category: unknown): ProductCategory => {
  if (typeof category === "string" && category in CATEGORY_MAPPING) {
    return category as ProductCategory;
  }
  return "beverage";
};

// 카테고리 표시명 가져오기
export const getCategoryDisplayName = (category: ProductCategory): string => {
  return CATEGORY_MAPPING[category];
};

// 모든 카테고리 목록
export const ALL_CATEGORIES: ProductCategory[] = ["beverage", "food", "goods"];

// 특정 카테고리를 제외한 나머지 카테고리들
export const getOtherCategories = (
  excludeCategory: ProductCategory
): ProductCategory[] => {
  return ALL_CATEGORIES.filter((category) => category !== excludeCategory);
};
