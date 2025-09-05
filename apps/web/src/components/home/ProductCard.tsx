"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
}

export const ProductCard = React.memo(
  ({ product, onClick }: ProductCardProps) => {
    const handleClick = useCallback(() => {
      onClick?.(product);
    }, [product, onClick]);

    return (
      <div className="flex-shrink-0 w-28 cursor-pointer" onClick={handleClick}>
        {/* 동그라미 이미지 */}
        <div className="w-28 h-28 rounded-full overflow-hidden mb-2">
          <Image
            src={product.productImg}
            alt={product.productName}
            width={112}
            height={112}
            className="w-full h-full object-cover"
            sizes="(max-width: 768px) 112px, 112px"
            priority={false}
            loading="lazy"
          />
        </div>
        {/* 상품명 - 중앙 정렬, 전체 표시 */}
        <h3 className="text-sm font-medium text-gray-900 text-center leading-tight">
          {product.productName}
        </h3>
      </div>
    );
  }
);

ProductCard.displayName = "ProductCard";
