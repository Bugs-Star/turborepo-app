"use client";

import React, { useCallback } from "react";
import { Product } from "@/types";
import { useHybridRecommendations } from "@/hooks/useHybridRecommendations";
import { SectionAsyncWrapper, RecommendedMenuSkeleton } from "@/components/ui";
import { ProductCard } from "./ProductCard";

interface RecommendedMenuProps {
  onProductClick?: (product: Product) => void;
}

export default React.memo(function RecommendedMenu({
  onProductClick,
}: RecommendedMenuProps) {
  const { 
    data: products, 
    isLoading, 
    error, 
    recommendationType 
  } = useHybridRecommendations({ limit: 5 });

  const renderProductList = useCallback(
    () => (
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
        {products?.products?.map((product: any) => (
          <ProductCard
            key={product._id}
            product={product as Product}
            onClick={onProductClick}
          />
        ))}
      </div>
    ),
    [products, onProductClick]
  );

  // 추천 타입에 따른 제목 결정
  const getTitle = () => {
    switch (recommendationType) {
      case 'personalized':
        return "맞춤 추천 메뉴";
      case 'fallback':
        return "인기 추천 메뉴";
      case 'manual':
        return "오늘의 추천 메뉴";
      default:
        return "추천 메뉴";
    }
  };

  return (
    <SectionAsyncWrapper
      loading={isLoading}
      error={error}
      title={getTitle()}
      loadingMessage="추천 메뉴를 불러오는 중..."
      errorMessage="추천 메뉴를 불러올 수 없습니다."
      skeleton={<RecommendedMenuSkeleton count={5} />}
    >
      {renderProductList()}
    </SectionAsyncWrapper>
  );
});
