"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { BottomNavigation } from "@/components/layout";
import AsyncWrapper from "@/components/ui/AsyncWrapper";
import AddToCartButton from "@/components/menu/AddToCartButton";
import ProductHeader from "@/components/menu/ProductHeader";
import ProductImage from "@/components/menu/ProductImage";
import ProductDetails from "@/components/menu/ProductDetails";
import { useProductDetailsFetch } from "@/hooks/useProductDetailsFetch";
import { useAnalytics, useProductDetailActions } from "@/hooks";

export default function MenuItemDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const { product, loading, error, refetch } =
    useProductDetailsFetch(productId);
  const [quantity, setQuantity] = useState(1);

  // 로거 훅들
  const { trackScreenView } = useAnalytics();
  const { handleProductView, handleCartAdd } = useProductDetailActions();

  // 중복 로깅 방지를 위한 ref
  const hasLoggedScreenView = useRef(false);
  const hasLoggedProductView = useRef(false);

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };

  // 페이지 로드 시 화면 조회 로그 (브라우저에서만 실행, 한 번만)
  useEffect(() => {
    if (typeof window !== "undefined" && !hasLoggedScreenView.current) {
      trackScreenView(`/menu/${productId}`);
      hasLoggedScreenView.current = true;
    }
  }, [trackScreenView, productId]);

  // 상품 데이터가 로드되면 상품 뷰 로그 (한 번만)
  useEffect(() => {
    if (product && !hasLoggedProductView.current) {
      handleProductView(product);
      hasLoggedProductView.current = true;
    }
  }, [product, handleProductView]);

  return (
    <AsyncWrapper
      loading={loading}
      error={error}
      loadingMessage="상품 정보를 불러오는 중..."
      errorMessage="잠시 후 다시 시도해주세요."
      onRetry={refetch}
    >
      {product && (
        <div className="min-h-screen bg-white flex flex-col pb-20">
          {/* Product Header */}
          <ProductHeader productName={product.productName} />

          {/* Main Content */}
          <div className="flex-1">
            {/* Product Image */}
            <ProductImage src={product.productImg} alt={product.productName} />

            {/* Product Details */}
            <div className="px-6">
              <ProductDetails
                product={product}
                quantity={quantity}
                onQuantityChange={handleQuantityChange}
              />

              {/* Add to Cart Button */}
              <AddToCartButton
                product={product}
                quantity={quantity}
                onCartAdd={handleCartAdd}
              />
            </div>
          </div>

          {/* Bottom Navigation */}
          <BottomNavigation />
        </div>
      )}
    </AsyncWrapper>
  );
}
