import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { Product, SortOption, SortFunction } from "@/types/product";
import { useDebounce } from "./useDebounce";
import { SEARCH_DEBOUNCE_DELAY } from "@/types/constants";

interface UseProductFilterParams {
  products: Product[];
  initialSortOption?: SortOption;
  debounceDelay?: number;
  onSearchLog?: (keyword: string, resultCount: number) => void;
  onSortLog?: (sortOption: string) => void;
}

interface UseProductFilterReturn {
  // 상태
  searchTerm: string;
  sortOption: SortOption;
  debouncedSearchTerm: string;

  // 필터링된 결과
  filteredProducts: Product[];
  sortedAndFilteredProducts: Product[];

  // 핸들러
  handleSearch: (term: string) => void;
  handleSort: (option: SortOption) => void;
}

export function useProductFilter({
  products,
  initialSortOption = "latest",
  debounceDelay = SEARCH_DEBOUNCE_DELAY,
  onSearchLog,
  onSortLog,
}: UseProductFilterParams): UseProductFilterReturn {
  // 상태 관리
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>(initialSortOption);

  // 디바운싱된 검색어
  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay);

  // 검색 로그를 위한 ref
  const previousResultCount = useRef<number>(0);

  // 정렬 함수
  const sortProducts: SortFunction = useCallback(
    (products: Product[], sortOption: SortOption) => {
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
    },
    []
  );

  // 검색 필터링
  const filteredProducts = useMemo(() => {
    return products.filter((product: Product) => {
      if (!debouncedSearchTerm.trim()) return true;
      return product.productName
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase());
    });
  }, [products, debouncedSearchTerm]);

  // 정렬
  const sortedAndFilteredProducts = useMemo(() => {
    return sortProducts(filteredProducts, sortOption);
  }, [filteredProducts, sortOption, sortProducts]);

  // 검색 결과 변화 감지 및 로그 생성
  useEffect(() => {
    const currentResultCount = filteredProducts.length;

    // 조건: 검색어가 있고 + 결과 수가 변경되었을 때
    if (
      debouncedSearchTerm.trim() &&
      currentResultCount !== previousResultCount.current
    ) {
      onSearchLog?.(debouncedSearchTerm, currentResultCount);
      previousResultCount.current = currentResultCount;
    }
  }, [debouncedSearchTerm, filteredProducts.length, onSearchLog]);

  // 핸들러
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleSort = useCallback(
    (option: SortOption) => {
      setSortOption(option);
      onSortLog?.(option);
    },
    [onSortLog]
  );

  return {
    // 상태
    searchTerm,
    sortOption,
    debouncedSearchTerm,

    // 필터링된 결과
    filteredProducts,
    sortedAndFilteredProducts,

    // 핸들러
    handleSearch,
    handleSort,
  };
}
