"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { BottomNavigation } from "@/components/layout";
import { useInfiniteProductFetch } from "@/hooks";
import ProductGrid from "@/components/menu/ProductGrid";
import { AsyncWrapper, PageHeader, InfiniteScroll } from "@/components/ui";
import CategoryFilter from "@/components/menu/CategoryFilter";

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

  // URL 파라미터가 변경되면 refetch 실행
  useEffect(() => {
    refetch();
  }, [initialCategory, refetch]);

  const handleCategoryChange = (category: string) => {
    // 카테고리가 변경되면 URL 업데이트 (선택사항)
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
          onCategoryChange={handleCategoryChange}
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
