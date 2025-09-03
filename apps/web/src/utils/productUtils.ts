import type { Product, SortOption } from "@/types/product";

/**
 * 상품 검색 필터링 함수
 */
export function filterProductsByName(
  products: Product[],
  searchTerm: string
): Product[] {
  if (!searchTerm.trim()) return products;

  const lowerSearchTerm = searchTerm.toLowerCase();
  return products.filter((product) =>
    product.productName.toLowerCase().includes(lowerSearchTerm)
  );
}

/**
 * 상품 정렬 함수
 */
export function sortProducts(
  products: Product[],
  sortOption: SortOption
): Product[] {
  const sortedProducts = [...products];

  switch (sortOption) {
    case "latest":
      return sortedProducts;
    case "price-low":
      return sortedProducts.sort((a, b) => a.price - b.price);
    case "price-high":
      return sortedProducts.sort((a, b) => b.price - a.price);
    case "name":
      return sortedProducts.sort((a, b) =>
        a.productName.localeCompare(b.productName, "ko")
      );
    default:
      return sortedProducts;
  }
}

/**
 * 상품 재고 상태 확인 함수
 */
export function getProductStockStatus(product: Product) {
  const { currentStock, optimalStock } = product;

  if (currentStock === 0) {
    return { status: "out-of-stock", percentage: 0 };
  }

  const percentage = Math.round((currentStock / optimalStock) * 100);

  if (percentage <= 20) {
    return { status: "low-stock", percentage };
  }

  return { status: "in-stock", percentage };
}

/**
 * 상품 가격 포맷팅 함수
 */
export function formatProductPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(price);
}

/**
 * 상품 검색 결과 요약 함수
 */
export function getSearchSummary(
  totalProducts: number,
  filteredProducts: number,
  searchTerm: string
): string {
  if (!searchTerm.trim()) {
    return `전체 ${totalProducts}개 상품`;
  }

  if (filteredProducts === 0) {
    return `"${searchTerm}"에 대한 검색 결과가 없습니다`;
  }

  return `"${searchTerm}" 검색 결과 ${filteredProducts}개 상품`;
}
