"use client";

import { Promotion } from "@/lib/services";

interface FeaturedPromoProps {
  promotion: Promotion;
  onButtonClick?: () => void;
}

export default function FeaturedPromo({
  promotion,
  onButtonClick,
}: FeaturedPromoProps) {
  return (
    <div
      className="relative h-50 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
      onClick={onButtonClick}
    >
      {/* 배경 이미지 */}
      {promotion.promotionImg && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${promotion.promotionImg})`,
          }}
        />
      )}

      {/* 그라데이션 오버레이 */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white/100 via-white/50 to-transparent" />

      {/* 콘텐츠 */}
      <div className="relative z-10 h-full flex flex-col justify-start p-6">
        <div className="text-white">
          {/* 제목 */}
          <h2 className="text-2xl font-bold mb-2 leading-tight">
            {promotion.title}
          </h2>

          {/* 설명 */}
          <p className="text-sm text-gray-200 line-clamp-2">
            {promotion.description}
          </p>
        </div>
      </div>
    </div>
  );
}
