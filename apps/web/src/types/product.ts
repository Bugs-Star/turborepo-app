// 기존 Product 타입을 확장하여 더 강력한 타입 시스템 구축
export interface BaseProduct {
  _id: string;
  productName: string;
  productImg: string;
  price: number;
  category: string;
}

export interface Product extends BaseProduct {
  productContents: string;
  currentStock: number;
  isRecommended: boolean;
  optimalStock: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface ProductQueryParams {
  category?: string;
  page?: number;
  limit?: number;
  isRecommended?: boolean;
}

// 상품 카테고리 타입
export type ProductCategory = "beverage" | "food" | "goods";

// 상품 카테고리 매핑
export const PRODUCT_CATEGORIES: Record<ProductCategory, string> = {
  beverage: "음료",
  food: "푸드",
  goods: "상품",
} as const;

// 상품 상태 타입
export interface ProductStatus {
  isOutOfStock: boolean;
  isLowStock: boolean;
  stockPercentage: number;
}

// 상품 필터 옵션
export interface ProductFilterOptions {
  category?: ProductCategory;
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
  isRecommended?: boolean;
}
