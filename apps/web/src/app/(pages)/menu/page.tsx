"use client";

import { BottomNavigation } from "@/components/layout";
import { useProductFetch } from "@/hooks/useProductFetch";
import ProductGrid from "@/components/menu/ProductGrid";
import { AsyncWrapper, PageHeader } from "@/components/ui";
import CategoryFilter from "@/components/menu/CategoryFilter";

export default function MenuPage() {
  const { products, loading, error, refetch } = useProductFetch();

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
        <CategoryFilter products={products}>
          {(filteredProducts) => (
            <div className="flex-1 px-4 pb-6">
              <ProductGrid products={filteredProducts} />
            </div>
          )}
        </CategoryFilter>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </AsyncWrapper>
  );
}
