"use client";

import Image from "next/image";
import { Product } from "@/types";
import { useRecommendedMenuFetch } from "@/hooks/useRecommendedMenuFetch";
import { SectionAsyncWrapper } from "@/components/ui";

interface RecommendedMenuProps {
  onProductClick?: (product: Product) => void;
}

export default function RecommendedMenu({
  onProductClick,
}: RecommendedMenuProps) {
  const { data: products, isLoading, error } = useRecommendedMenuFetch();

  const renderProductList = () => (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {products?.products?.map((product: Product) => (
        <div
          key={product._id}
          className="flex-shrink-0 w-32 bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onProductClick?.(product)}
        >
          <div className="w-32 h-32 rounded-t-lg overflow-hidden">
            <Image
              src={product.productImg}
              alt={product.productName}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-3">
            <h3 className="text-sm font-medium text-gray-900 mb-1 truncate">
              {product.productName}
            </h3>
            <p className="text-sm font-bold text-green-700">
              {product.price.toLocaleString()}원
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <SectionAsyncWrapper
      loading={isLoading}
      error={error}
      title="오늘의 추천 메뉴"
      loadingMessage="추천 메뉴를 불러오는 중..."
      errorMessage="추천 메뉴를 불러올 수 없습니다."
    >
      {renderProductList()}
    </SectionAsyncWrapper>
  );
}
