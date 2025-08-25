import type { Product, ProductStatus } from "@/types/product";

/**
 * 상품 관련 유틸리티 함수들
 * 비즈니스 로직과 데이터 처리를 위한 순수 함수들
 */

/**
 * 가격을 포맷팅합니다
 */
export const formatPrice = (price: number): string => {
  return price.toLocaleString() + "원";
};

/**
 * 상품의 재고 상태를 계산합니다
 */
export const getProductStatus = (product: Product): ProductStatus => {
  const { currentStock, optimalStock } = product;
  const stockPercentage = (currentStock / optimalStock) * 100;

  return {
    isOutOfStock: currentStock <= 0,
    isLowStock: currentStock > 0 && stockPercentage <= 20,
    stockPercentage: Math.round(stockPercentage),
  };
};

/**
 * 상품 목록을 카테고리별로 그룹화합니다
 */
export const groupProductsByCategory = (
  products: Product[]
): Record<string, Product[]> => {
  return products.reduce(
    (groups, product) => {
      const category = product.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(product);
      return groups;
    },
    {} as Record<string, Product[]>
  );
};

/**
 * 상품 목록을 가격 범위로 필터링합니다
 */
export const filterByPriceRange = (
  products: Product[],
  minPrice: number,
  maxPrice: number
): Product[] => {
  return products.filter(
    (product) => product.price >= minPrice && product.price <= maxPrice
  );
};

/**
 * 상품 목록을 재고 상태로 필터링합니다
 */
export const filterByStockStatus = (
  products: Product[],
  inStock: boolean
): Product[] => {
  return products.filter((product) => {
    const status = getProductStatus(product);
    return inStock ? !status.isOutOfStock : status.isOutOfStock;
  });
};

/**
 * 상품을 가격순으로 정렬합니다
 */
export const sortProductsByPrice = (
  products: Product[],
  order: "asc" | "desc" = "asc"
): Product[] => {
  return [...products].sort((a, b) => {
    return order === "asc" ? a.price - b.price : b.price - a.price;
  });
};

/**
 * 상품을 이름순으로 정렬합니다
 */
export const sortProductsByName = (
  products: Product[],
  order: "asc" | "desc" = "asc"
): Product[] => {
  return [...products].sort((a, b) => {
    const comparison = a.productName.localeCompare(b.productName);
    return order === "asc" ? comparison : -comparison;
  });
};

/**
 * 상품 목록에서 특정 카테고리의 상품만 필터링합니다
 */
export const filterProductsByCategory = (
  products: Product[],
  category: string
): Product[] => {
  return products.filter((product) => product.category === category);
};

/**
 * 상품 목록에서 사용 가능한 상품만 필터링합니다
 */
export const filterAvailableProducts = (products: Product[]): Product[] => {
  return products.filter((product) => product.currentStock > 0);
};

/**
 * 상품 검색을 수행합니다
 */
export const searchProducts = (
  products: Product[],
  searchTerm: string
): Product[] => {
  const term = searchTerm.toLowerCase();
  return products.filter(
    (product) =>
      product.productName.toLowerCase().includes(term) ||
      product.productContents.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term)
  );
};

/**
 * 추천 상품들을 필터링합니다
 */
export const getRecommendedProducts = (products: Product[]): Product[] => {
  return products.filter((product) => product.isRecommended);
};

/**
 * 인기 상품들을 계산합니다 (재고 감소량 기반)
 */
export const getPopularProducts = (products: Product[]): Product[] => {
  return products
    .filter((product) => {
      const status = getProductStatus(product);
      return status.stockPercentage < 80; // 재고가 80% 이하인 상품들
    })
    .sort((a, b) => {
      const aStatus = getProductStatus(a);
      const bStatus = getProductStatus(b);
      return aStatus.stockPercentage - bStatus.stockPercentage;
    });
};

/**
 * 카테고리명을 한글로 변환합니다
 */
export const getCategoryDisplayName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    beverage: "음료",
    food: "푸드",
    goods: "상품",
  };

  return categoryMap[category] || category;
};

/**
 * 상품의 할인율을 계산합니다 (향후 할인 기능 대비)
 */
export const calculateDiscountPercentage = (
  originalPrice: number,
  salePrice: number
): number => {
  if (originalPrice <= salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

/**
 * 상품의 총 가치를 계산합니다
 */
export const calculateTotalValue = (products: Product[]): number => {
  return products.reduce(
    (total, product) => total + product.price * product.currentStock,
    0
  );
};

/**
 * 재고 부족 상품들을 식별합니다
 */
export const getLowStockProducts = (products: Product[]): Product[] => {
  return products.filter((product) => {
    const status = getProductStatus(product);
    return status.isLowStock || status.isOutOfStock;
  });
};

/**
 * 상품 데이터의 유효성을 검증합니다
 */
export const validateProduct = (product: Partial<Product>): boolean => {
  return !!(
    product.productName &&
    product.price &&
    product.price > 0 &&
    product.category &&
    typeof product.currentStock === "number" &&
    product.currentStock >= 0
  );
};

/**
 * 상품 목록을 페이지네이션합니다
 */
export const paginateProducts = (
  products: Product[],
  page: number,
  pageSize: number
): {
  products: Product[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
} => {
  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    products: products.slice(startIndex, endIndex),
    totalPages,
    currentPage: page,
    totalItems,
  };
};

/**
 * 상품의 평균 평점을 계산합니다
 */
export const calculateAverageRating = (ratings: number[]): number => {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
};

/**
 * 상품의 할인율을 계산합니다
 */
export const calculateDiscountRate = (
  originalPrice: number,
  discountedPrice: number
): number => {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

/**
 * 상품의 할인된 가격을 계산합니다
 */
export const calculateDiscountedPrice = (
  originalPrice: number,
  discountRate: number
): number => {
  return Math.round(originalPrice * (1 - discountRate / 100));
};
