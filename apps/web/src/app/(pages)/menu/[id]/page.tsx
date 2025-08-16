"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { BottomNavigation } from "@/components/layout";
import AsyncWrapper from "@/components/ui/AsyncWrapper";
import AddToCartButton from "@/components/menu/AddToCartButton";
import ProductHeader from "@/components/menu/ProductHeader";
import ProductImage from "@/components/menu/ProductImage";
import ProductDetails from "@/components/menu/ProductDetails";
import { useProductDetailsFetch } from "@/hooks/useProductDetailsFetch";

export default function MenuItemDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const { product, loading, error } = useProductDetailsFetch(productId);
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };

  return (
    <AsyncWrapper
      loading={loading}
      error={error}
      loadingMessage="상품 정보를 불러오는 중..."
      errorMessage="다시 시도해주세요."
    >
      {product && (
        <div className="min-h-screen bg-white flex flex-col pb-20">
          <ProductHeader productName={product.productName} />
          <ProductImage src={product.productImg} alt={product.productName} />
          <ProductDetails
            product={product}
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
          />
          <AddToCartButton product={product} quantity={quantity} />
          <BottomNavigation />
        </div>
      )}
    </AsyncWrapper>
  );
}
