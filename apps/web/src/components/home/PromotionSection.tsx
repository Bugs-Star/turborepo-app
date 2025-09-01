"use client";

import { useState } from "react";
import { Promotion } from "@/lib/services";
import { Button } from "@repo/ui";
import { SectionAsyncWrapper, PromoBannerSkeleton } from "@/components/ui";

interface PromotionSectionProps {
  promotions: Promotion[];
  loading?: boolean;
  onPromoClick?: (promotion: Promotion) => void;
}

export default function PromotionSection({
  promotions,
  loading = false,
  onPromoClick,
}: PromotionSectionProps) {
  const [displayCount, setDisplayCount] = useState(3);
  const ITEMS_PER_PAGE = 3;

  // 최근 순으로 정렬된 프로모션 (최신이 먼저 오도록)
  const sortedPromotions = [...promotions].sort((a, b) => {
    return (
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
    );
  });

  // 현재 표시할 프로모션들
  const displayedPromotions = sortedPromotions.slice(0, displayCount);

  // 더보기 버튼 표시 여부
  const hasMorePromotions = displayCount < sortedPromotions.length;

  // 더보기 버튼 클릭 핸들러
  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
  };

  return (
    <SectionAsyncWrapper
      loading={loading}
      error={null}
      title="혜택 가득, 즐거움 한가득"
      subtitle="할인으로 실속 챙기고, 이벤트로 특별한 선물까지 만나보세요!"
      loadingMessage="프로모션을 불러오는 중..."
      errorMessage="프로모션을 불러올 수 없습니다."
      skeleton={<PromoBannerSkeleton />}
    >
      <div className="space-y-4">
        {displayedPromotions.map((promotion) => (
          <div
            key={promotion._id}
            className="mb-4 mt-2 rounded-lg p-8 relative overflow-hidden"
          >
            {/* 배경 이미지 레이어 */}
            {promotion.promotionImg && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-50"
                style={{
                  backgroundImage: `url(${promotion.promotionImg})`,
                }}
              />
            )}

            {/* 콘텐츠 */}
            <div className="relative z-10">
              <div className="flex-1 pr-4">
                <h2 className="text-xl font-bold text-black mb-2">
                  {promotion.title}
                </h2>
                <p className="text-sm text-black mb-4 leading-relaxed line-clamp-1 overflow-hidden text-ellipsis">
                  {promotion.description}
                </p>
                <Button
                  onClick={() => onPromoClick?.(promotion)}
                  variant="white"
                  size="sm"
                >
                  자세히 보기
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* 더보기 버튼 */}
        {hasMorePromotions && (
          <div className="flex justify-center pt-1">
            <button
              onClick={handleLoadMore}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-800 hover:font-medium cursor-pointer transition-colors"
            >
              더 보기
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </SectionAsyncWrapper>
  );
}
