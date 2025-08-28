// 상품 관련 상수
export const PRODUCT_CATEGORIES = {
  beverage: "음료",
  food: "푸드",
  goods: "상품",
} as const;

export const SORT_OPTIONS = {
  latest: "최신순",
  "price-low": "가격 낮은순",
  "price-high": "가격 높은순",
  name: "이름순",
} as const;

// 페이지네이션 상수
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// 검색 관련 상수
export const SEARCH_DEBOUNCE_DELAY = 500; // ms
export const MIN_SEARCH_LENGTH = 1;

// UI 관련 상수
export const GRID_COLUMNS_OPTIONS = [2, 3, 4] as const;
export const DEFAULT_GRID_COLUMNS = 2;

// 재고 관련 상수
export const LOW_STOCK_THRESHOLD = 10; // 개
export const OUT_OF_STOCK_THRESHOLD = 0; // 개
