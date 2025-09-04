"use client";

import React, { useCallback } from "react";
import { Product } from "@/types";
import { useRecommendedMenuFetch } from "@/hooks/useRecommendedMenuFetch";
import { SectionAsyncWrapper, RecommendedMenuSkeleton } from "@/components/ui";
import { ProductCard } from "./ProductCard";

interface RecommendedMenuProps {
  onProductClick?: (product: Product) => void;
}

export default React.memo(function RecommendedMenu({
  onProductClick,
}: RecommendedMenuProps) {
  const { data: products, isLoading, error } = useRecommendedMenuFetch();

  const renderProductList = useCallback(
    () => (
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {products?.products?.map((product: Product) => (
          <ProductCard
            key={product._id}
            product={product}
            onClick={onProductClick}
          />
        ))}
      </div>
    ),
    [products, onProductClick]
  );

  return (
    <SectionAsyncWrapper
      loading={isLoading}
      error={error}
      title="오늘의 추천 메뉴"
      loadingMessage="추천 메뉴를 불러오는 중..."
      errorMessage="추천 메뉴를 불러올 수 없습니다."
      skeleton={<RecommendedMenuSkeleton count={5} />}
    >
      {renderProductList()}
    </SectionAsyncWrapper>
  );
});
