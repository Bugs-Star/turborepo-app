"use client";

import { BottomNavigation } from "@/components/layout";
import { useProductFetch } from "@/hooks/useProductFetch";
import ProductGrid from "@/components/menu/ProductGrid";
import AsyncWrapper from "@/components/ui/AsyncWrapper";
import CategoryFilter from "@/components/menu/CategoryFilter";

export default function MenuPage() {
  const { products, loading, error } = useProductFetch();

  return (
    <AsyncWrapper loading={loading} error={error}>
      <div className="min-h-screen bg-white flex flex-col pb-20">
        {/* Header */}
        <div className="px-4 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-center text-black mb-6">
            메뉴
          </h1>

          {/* Category Filter with Product Grid */}
          <CategoryFilter products={products}>
            {(filteredProducts) => (
              <div className="flex-1 px-4 pb-6">
                <ProductGrid products={filteredProducts} />
              </div>
            )}
          </CategoryFilter>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </AsyncWrapper>
  );
}
