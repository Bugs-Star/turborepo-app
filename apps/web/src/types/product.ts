// 기존 Product 타입을 확장하여 더 강력한 타입 시스템 구축
export interface BaseProduct {
  _id: string;
  productName: string;
  productImg: string;
  price: number;
  category: string; // API 호환성을 위해 string 유지
}

export interface Product extends BaseProduct {
  productContents: string;
  currentStock: number;
  isRecommended: boolean;
  optimalStock: number;
}

// 상품 생성/수정 시 사용하는 타입 (필수 필드만)
export type CreateProductData = Omit<Product, "_id">;
export type UpdateProductData = Partial<Omit<Product, "_id">>;

// 상품 응답 타입 (공통 타입 활용)
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
  category?: string; // API 호환성을 위해 string 유지
  page?: number;
  limit?: number;
  isRecommended?: boolean;
}

// 상품 카테고리 타입
export type ProductCategory = "beverage" | "food" | "goods";

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

// 정렬 옵션 타입
export type SortOption = "latest" | "price-low" | "price-high" | "name";

// 정렬 옵션 인터페이스
export interface SortOptionItem {
  value: SortOption;
  label: string;
}

// 정렬 함수 타입
export type SortFunction = (
  products: Product[],
  sortOption: SortOption
) => Product[];

// 상품 검색 관련 타입
export interface ProductSearchParams {
  query: string;
  category?: ProductCategory;
  sortOption?: SortOption;
  page?: number;
  limit?: number;
}

// 상품 목록 표시 옵션
export interface ProductDisplayOptions {
  showStock: boolean;
  showPrice: boolean;
  showCategory: boolean;
  gridColumns: 2 | 3 | 4;
}
