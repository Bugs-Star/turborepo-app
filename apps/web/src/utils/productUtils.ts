import type { Product, ProductStatus } from "@/types/product";

/**
 * 상품 관련 유틸리티 함수들
 * 비즈니스 로직과 데이터 처리를 위한 순수 함수들
 */
export class ProductUtils {
  /**
   * 가격을 포맷팅합니다
   */
  static formatPrice(price: number): string {
    return price.toLocaleString() + "원";
  }

  /**
   * 상품의 재고 상태를 계산합니다
   */
  static getProductStatus(product: Product): ProductStatus {
    const { currentStock, optimalStock } = product;
    const stockPercentage = (currentStock / optimalStock) * 100;

    return {
      isOutOfStock: currentStock <= 0,
      isLowStock: currentStock > 0 && stockPercentage <= 20,
      stockPercentage: Math.round(stockPercentage),
    };
  }

  /**
   * 상품 목록을 카테고리별로 그룹화합니다
   */
  static groupProductsByCategory(
    products: Product[]
  ): Record<string, Product[]> {
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
  }

  /**
   * 상품 목록을 가격 범위로 필터링합니다
   */
  static filterByPriceRange(
    products: Product[],
    minPrice: number,
    maxPrice: number
  ): Product[] {
    return products.filter(
      (product) => product.price >= minPrice && product.price <= maxPrice
    );
  }

  /**
   * 상품 목록을 재고 상태로 필터링합니다
   */
  static filterByStockStatus(products: Product[], inStock: boolean): Product[] {
    return products.filter((product) => {
      const status = this.getProductStatus(product);
      return inStock ? !status.isOutOfStock : status.isOutOfStock;
    });
  }

  /**
   * 상품 목록을 정렬합니다
   */
  static sortProducts(
    products: Product[],
    sortBy: "name" | "price" | "stock" | "recommended",
    order: "asc" | "desc" = "asc"
  ): Product[] {
    const sorted = [...products].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.productName.localeCompare(b.productName);
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "stock":
          comparison = a.currentStock - b.currentStock;
          break;
        case "recommended":
          comparison = Number(b.isRecommended) - Number(a.isRecommended);
          break;
      }

      return order === "asc" ? comparison : -comparison;
    });

    return sorted;
  }

  /**
   * 상품 검색을 수행합니다
   */
  static searchProducts(products: Product[], searchTerm: string): Product[] {
    const term = searchTerm.toLowerCase().trim();

    if (!term) return products;

    return products.filter(
      (product) =>
        product.productName.toLowerCase().includes(term) ||
        product.productContents.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
    );
  }

  /**
   * 추천 상품들을 필터링합니다
   */
  static getRecommendedProducts(products: Product[]): Product[] {
    return products.filter((product) => product.isRecommended);
  }

  /**
   * 인기 상품들을 계산합니다 (재고 감소량 기반)
   */
  static getPopularProducts(products: Product[]): Product[] {
    return products
      .filter((product) => {
        const status = this.getProductStatus(product);
        return status.stockPercentage < 80; // 재고가 80% 이하인 상품들
      })
      .sort((a, b) => {
        const aStatus = this.getProductStatus(a);
        const bStatus = this.getProductStatus(b);
        return aStatus.stockPercentage - bStatus.stockPercentage;
      });
  }

  /**
   * 카테고리명을 한글로 변환합니다
   */
  static getCategoryDisplayName(category: string): string {
    const categoryMap: Record<string, string> = {
      beverage: "음료",
      food: "푸드",
      goods: "상품",
    };

    return categoryMap[category] || category;
  }

  /**
   * 상품 할인율을 계산합니다 (향후 할인 기능 대비)
   */
  static calculateDiscountPercentage(
    originalPrice: number,
    salePrice: number
  ): number {
    if (originalPrice <= salePrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  }

  /**
   * 상품의 총 가치를 계산합니다
   */
  static calculateTotalValue(products: Product[]): number {
    return products.reduce(
      (total, product) => total + product.price * product.currentStock,
      0
    );
  }

  /**
   * 재고 부족 상품들을 식별합니다
   */
  static getLowStockProducts(products: Product[]): Product[] {
    return products.filter((product) => {
      const status = this.getProductStatus(product);
      return status.isLowStock || status.isOutOfStock;
    });
  }

  /**
   * 상품 데이터의 유효성을 검증합니다
   */
  static validateProduct(product: Partial<Product>): boolean {
    return !!(
      product.productName &&
      product.price &&
      product.price > 0 &&
      product.category &&
      typeof product.currentStock === "number" &&
      product.currentStock >= 0
    );
  }

  /**
   * 상품 목록을 페이지네이션합니다
   */
  static paginateProducts(
    products: Product[],
    page: number,
    pageSize: number
  ): {
    products: Product[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
  } {
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
  }
}
