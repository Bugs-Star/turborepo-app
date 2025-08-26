"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { BottomNavigation } from "@/components/layout";
import { useInfiniteProductFetch } from "@/hooks";
import ProductGrid from "@/components/menu/ProductGrid";
import { AsyncWrapper, PageHeader, InfiniteScroll } from "@/components/ui";
import CategoryFilter from "@/components/menu/CategoryFilter";
import { useAnalytics, useMenuActions } from "@/hooks";

export default function MenuPage() {
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
  const { trackScreenView } = useAnalytics();
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

        {/* Category Filter with Product Grid */}
        <CategoryFilter
          products={products}
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
          {(filteredProducts, activeCategory) => (
            <div className="flex-1 px-4 pb-6">
              <InfiniteScroll
                onLoadMore={fetchNextPage}
                hasMore={hasNextPage}
                loading={isFetchingNextPage}
                threshold={0.1}
                rootMargin="100px"
              >
                <ProductGrid
                  products={filteredProducts}
                  activeCategory={activeCategory}
                  onProductClick={handleProductClick}
                />
              </InfiniteScroll>
            </div>
          )}
        </CategoryFilter>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </AsyncWrapper>
  );
}
