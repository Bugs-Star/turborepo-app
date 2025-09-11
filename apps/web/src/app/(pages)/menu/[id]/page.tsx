"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { BottomNavigation, Footer } from "@/components/layout";
import AsyncWrapper from "@/components/ui/AsyncWrapper";
import AddToCartButton from "@/components/menu/AddToCartButton";
import ProductHeader from "@/components/menu/ProductHeader";
import ProductImage from "@/components/menu/ProductImage";
import ProductDetails from "@/components/menu/ProductDetails";
import QuantitySelector from "@/components/menu/QuantitySelector";
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
  const { handleCartAdd } = useProductDetailActions();

  // 중복 로깅 방지를 위한 ref
  const hasLoggedScreenView = useRef(false);

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };

  // 상품 코드를 사용한 스크린 뷰 로그 (상품 데이터 로드 후)
  useEffect(() => {
    if (product && !hasLoggedScreenView.current) {
      trackScreenView(`/menu/${product.productCode}`);
      hasLoggedScreenView.current = true;
    }
  }, [product, trackScreenView]);

  return (
    <AsyncWrapper
      loading={loading}
      error={error}
      loadingMessage="상품 정보를 불러오는 중..."
      errorMessage="잠시 후 다시 시도해주세요."
      onRetry={refetch}
      useSkeleton={true}
    >
      {product && (
        <div className="min-h-screen bg-white flex flex-col pb-50">
          {/* Product Header */}
          <ProductHeader productName={product.productName} />

          {/* Main Content */}
          <div className="flex-1">
            {/* Product Image */}
            <ProductImage src={product.productImg} alt={product.productName} />

            {/* Product Details */}
            <div className="px-6 mb-50">
              <ProductDetails product={product} />
            </div>
          </div>

          {/* Quantity Selector - 하단 고정 */}
          <QuantitySelector
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            isOutOfStock={product.currentStock <= 0}
            product={product}
          />

          {/* Add to Cart Button - 하단 고정 */}
          <AddToCartButton
            product={product}
            quantity={quantity}
            onCartAdd={handleCartAdd}
          />

          {/* Footer */}
          <Footer />

          {/* Bottom Navigation */}
          <BottomNavigation />
        </div>
      )}
    </AsyncWrapper>
  );
}
