"use client";

import React, { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { Product } from "@/types";
import { productService } from "@/lib/services";

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
}

export const ProductCard = React.memo(
  ({ product, onClick }: ProductCardProps) => {
    const [productImage, setProductImage] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(false);


    const handleClick = useCallback(() => {
      onClick?.(product);
    }, [product, onClick]);

    // 이미지가 없는 경우 개별 상품 API에서 가져오기
    useEffect(() => {
      const loadProductImage = async () => {
        // 이미지가 이미 있으면 그대로 사용
        if (product.productImg) {
          setProductImage(product.productImg);
          return;
        }

        // MongoDB _id를 우선 사용, 없으면 productCode 사용
        const productId = product._id || product.productCode;
        if (productId && !imageLoading && !productImage) {
          setImageLoading(true);
          try {
            const productDetail = await productService.getProduct(productId);
            setProductImage(productDetail.product.productImg);
          } catch (error) {
            console.error(`[ProductCard] 상품 이미지 로드 실패: ${productId}`, error);
            
            // _id로 실패했고 productCode가 있다면 productCode로 재시도
            if (product._id && product.productCode && productId === product._id) {
              try {
                const productDetail = await productService.getProduct(product.productCode);
                setProductImage(productDetail.product.productImg);
              } catch (retryError) {
                console.error(`[ProductCard] productCode로도 실패: ${product.productCode}`, retryError);
                setProductImage(null);
              }
            } else {
              setProductImage(null);
            }
          } finally {
            setImageLoading(false);
          }
        }
      };

      loadProductImage();
    }, [product.productImg, product.productCode, product._id]); // imageLoading 제거로 무한루프 방지

    return (
      <div className="flex-shrink-0 w-24 cursor-pointer" onClick={handleClick}>
        {/* 동그라미 이미지 */}
        <div className="w-24 h-24 rounded-full overflow-hidden mb-2 bg-gray-200">
          {productImage ? (
            <Image
              src={productImage}
              alt={product.productName}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              sizes="(max-width: 768px) 96px, 96px"
              priority={false}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              {imageLoading ? (
                <div className="animate-pulse bg-gray-300 w-full h-full rounded-full"></div>
              ) : (
                <div className="text-center">
                  <div className="text-gray-500 text-lg font-bold mb-1">
                    {product.productName.slice(0, 2)}
                  </div>
                  <div className="text-gray-400 text-xs">
                    이미지 없음
                  </div>
                </div>
              )}
            </div>
          )}
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
