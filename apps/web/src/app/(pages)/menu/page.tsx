"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";
import { BottomNavigation } from "@/components/layout";
import { useInfiniteProductFetch } from "@/hooks";
import ProductGrid from "@/components/menu/ProductGrid";
import { AsyncWrapper, PageHeader, InfiniteScroll } from "@/components/ui";
import CategoryFilter from "@/components/menu/CategoryFilter";
import SearchBox from "@/components/menu/SearchBox";
import { useAnalytics, useMenuActions, useProductFilter } from "@/hooks";

// useSearchParams를 사용하는 컴포넌트를 분리
function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "beverage";

  const {
    products,
    loading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProductFetch({
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
  const handleCategoryChangeWithURL = (category: string) => {
    // URL 업데이트
    const url = new URL(window.location.href);
    url.searchParams.set("category", category);
    window.history.replaceState({}, "", url.toString());
  };

  return (
    <AsyncWrapper
      loading={loading}
      error={error}
      loadingMessage="메뉴를 불러오는 중..."
      errorMessage="잠시 후 다시 시도해주세요."
      onRetry={refetch}
    >
      <div className="min-h-screen bg-white flex flex-col pb-20">
        <PageHeader title="메뉴" />

        {/* Category Filter - 고정 헤더 아래 여백 추가 */}
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
                {/* 고정된 검색 영역 - 카테고리 아래 */}
                <div className="fixed top-28 left-1/2 transform -translate-x-1/2 w-full max-w-md z-40 bg-white border-b border-gray-200">
                  {/* Search Box */}
                  <div className="px-6 pb-4">
                    <SearchBox
                      onSearch={handleSearch}
                      onSortChange={handleSort}
                      searchTerm={searchTerm}
                      sortOption={sortOption}
                    />
                  </div>
                </div>

                {/* 스크롤 가능한 상품 목록 - 고정 영역 아래 여백 추가 */}
                <div className="pt-36 flex-1 px-6 pb-6">
                  <InfiniteScroll
                    onLoadMore={() => fetchNextPage?.()}
                    hasMore={hasNextPage}
                    loading={isFetchingNextPage}
                    threshold={0.1}
                    rootMargin="100px"
                  >
                    <ProductGrid
                      products={categoryFilteredProducts}
                      activeCategory={activeCategory}
                      onProductClick={handleProductClick}
                    />
                  </InfiniteScroll>
                </div>
              </>
            )}
          </CategoryFilter>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </AsyncWrapper>
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
