"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";
import { BottomNavigation, Footer } from "@/components/layout";
import { useHybridProductFetch } from "@/hooks";
import ProductGrid from "@/components/menu/ProductGrid";
import { PageHeader, InfiniteScroll } from "@/components/ui";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import CategoryFilter from "@/components/menu/CategoryFilter";
import SearchBox from "@/components/menu/SearchBox";
import SortDropdown from "@/components/menu/SortDropdown";
import { useAnalytics, useMenuActions, useProductFilter } from "@/hooks";
import { validateCategory } from "@/utils/categoryUtils";
import type { ProductCategory } from "@/types/product";

// useSearchParams를 사용하는 컴포넌트를 분리
function MenuContent() {
  const searchParams = useSearchParams();
  const rawCategory = searchParams.get("category") || "beverage";
  const initialCategory = validateCategory(rawCategory);

  // 하이브리드 훅 사용
  const {
    products,
    loading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useHybridProductFetch({
    category: initialCategory,
    pageSize: 10,
  });

  // 로거 훅들
  const { trackScreenView, trackSearchSubmit, trackSortOptionSelect } =
    useAnalytics();

  // 상품 필터링 훅 사용
  const {
    searchTerm,
    sortOption,
    sortedAndFilteredProducts,
    handleSearch,
    handleSort,
  } = useProductFilter({
    products,
    initialSortOption: "latest",
    onSearchLog: trackSearchSubmit,
    onSortLog: trackSortOptionSelect,
  });
  const { handleProductClick, handleCategoryChange } = useMenuActions();

  // 중복 로깅 방지를 위한 ref
  const hasLoggedScreenView = useRef(false);

  // URL 파라미터가 변경되면 refetch 실행
  useEffect(() => {
    refetch();
  }, [initialCategory, refetch]);

  // 페이지 로드 시 화면 조회 로그 (브라우저에서만 실행, 한 번만)
  useEffect(() => {
    if (typeof window !== "undefined" && !hasLoggedScreenView.current) {
      trackScreenView("/menu");
      hasLoggedScreenView.current = true;
    }
  }, [trackScreenView]);

  // 카테고리 변경 핸들러 (URL 업데이트 + 로깅)
  const handleCategoryChangeWithURL = (category: ProductCategory) => {
    const url = new URL(window.location.href);
    url.searchParams.set("category", category);
    window.history.replaceState({}, "", url.toString());
  };

  // 에러 상태 처리
  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col pb-20">
        <PageHeader title="메뉴" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-600 text-center">
            <p className="text-sm mb-2">{error}</p>
            <p className="text-xs mb-4">잠시 후 다시 시도해주세요.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              다시 시도
            </button>
          </div>
        </div>
        <Footer />
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      <PageHeader title="메뉴" />

      <div className="pt-16">
        <CategoryFilter
          products={sortedAndFilteredProducts}
          initialCategory={initialCategory}
          onCategoryChange={handleCategoryChangeWithURL}
          onFilterChange={(category, previousCategory) =>
            handleCategoryChange(
              category,
              previousCategory,
              handleCategoryChangeWithURL
            )
          }
        >
          {(categoryFilteredProducts, activeCategory) => (
            <>
              <div className="fixed top-23 left-1/2 transform -translate-x-1/2 w-full max-w-lg z-40 bg-white border-b border-gray-100">
                <div className="px-6 pt-1 pb-2">
                  <SearchBox
                    onSearch={handleSearch}
                    searchTerm={searchTerm}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="pt-22 flex-1 px-6 pb-6">
                {/* 정렬 옵션 - 구분선 아래에 배치, 오른쪽 정렬 */}
                <div className="mb-4 flex justify-end">
                  <SortDropdown
                    onSortChange={handleSort}
                    selectedOption={sortOption}
                  />
                </div>

                <InfiniteScroll
                  onLoadMore={() => fetchNextPage?.()}
                  hasMore={hasNextPage}
                  loading={isFetchingNextPage}
                  threshold={0.1}
                  rootMargin="100px"
                >
                  {loading ? (
                    <ProductGridSkeleton count={8} />
                  ) : (
                    <ProductGrid
                      products={categoryFilteredProducts}
                      activeCategory={activeCategory}
                      onProductClick={handleProductClick}
                    />
                  )}
                </InfiniteScroll>
              </div>
            </>
          )}
        </CategoryFilter>
      </div>

      <Footer />
      <BottomNavigation />
    </div>
  );
}

// 로딩 컴포넌트
function MenuLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      <PageHeader title="메뉴" />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">메뉴를 불러오는 중...</div>
      </div>
      <Footer />
      <BottomNavigation />
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<MenuLoading />}>
      <MenuContent />
    </Suspense>
  );
}
