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
      <div
        className="flex-shrink-0 w-[130px] bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleClick}
      >
        <div className="w-32 h-32 rounded-t-lg overflow-hidden">
          <Image
            src={product.productImg}
            alt={product.productName}
            width={128}
            height={128}
            className="w-full h-full object-cover"
            sizes="(max-width: 768px) 130px, 130px"
            priority={false}
            loading="lazy"
          />
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-900 mb-1 truncate">
            {product.productName}
          </h3>
          <p className="text-sm font-bold text-green-800">
            {product.price.toLocaleString()}원
          </p>
        </div>
      </div>
    );
  }
);

ProductCard.displayName = "ProductCard";
