"use client";

import { cn } from "@/utils/commonUtils";
import { BottomNavigation, Footer } from "@/components/layout";
import ProductHeader from "@/components/menu/ProductHeader";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

export function Skeleton({
  className,
  width,
  height,
  rounded = "md",
}: SkeletonProps) {
  const roundedClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200",
        roundedClasses[rounded],
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  );
}

// 상품 카드 스켈레톤
export function ProductCardSkeleton() {
  return (
    <div className="cursor-pointer">
      {/* Product Image Card - 실제 ProductCard와 동일한 스타일 */}
      <div className="bg-white rounded-md border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 relative mb-3">
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
      </div>

      {/* Product Info - 카드 밖에 배치, 실제 ProductCard와 동일한 스타일 */}
      <div className="px-1">
        {/* 제목 스켈레톤 */}
        <Skeleton className="h-4 mb-1 w-3/4" />
        {/* 가격 스켈레톤 */}
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

// 상품 그리드 스켈레톤
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

// 홈 페이지 추천 메뉴 스켈레톤 (가로 스크롤)
export function RecommendedMenuSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex-shrink-0 w-24">
          {/* 동그라미 이미지 스켈레톤 */}
          <div className="w-24 h-24 rounded-full overflow-hidden mb-2">
            <Skeleton className="w-full h-full" rounded="full" />
          </div>
          {/* 상품명 스켈레톤 */}
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

// 프로모션 배너 스켈레톤
export function PromoBannerSkeleton() {
  return (
    <div className="mb-6 mt-6 rounded-lg p-8 relative overflow-hidden bg-gray-100">
      <div className="relative z-10">
        <div className="flex-1 pr-4">
          <Skeleton className="h-6 mb-2 w-3/4" />
          <Skeleton className="h-4 mb-4 w-full" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}

// 이벤트 섹션 스켈레톤 (제목 제외)
export function EventSectionSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex-shrink-0 w-64 cursor-pointer">
          {/* 이미지 카드 스켈레톤 */}
          <div className="w-64 h-40 rounded-lg overflow-hidden mb-3 shadow-sm">
            <Skeleton className="w-full h-full" />
          </div>
          {/* 텍스트 영역 스켈레톤 */}
          <div className="px-1">
            <Skeleton className="h-4 mb-1 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 프로모션/이벤트 상세 페이지 스켈레톤
export function PromotionEventDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* 헤더 - 실제 ProductHeader 컴포넌트 사용하되 제목만 스켈레톤 */}
      <ProductHeader showSkeleton={true} />

      {/* Main Content */}
      <div className="flex-1">
        {/* 이미지 스켈레톤 */}
        <div className="relative w-full bg-gray-100 pt-14">
          <Skeleton className="aspect-video w-full" />
        </div>

        {/* 프로모션/이벤트 정보 스켈레톤 */}
        <div className="px-6 py-6 pb-20 bg-white">
          {/* 제목 */}
          <Skeleton className="h-8 w-3/4 mb-4" />

          {/* 기간 */}
          <Skeleton className="h-5 w-1/2 mb-6" />

          {/* 상세 설명 */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 상품 상세 페이지 스켈레톤
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white flex flex-col pb-50">
      {/* 헤더 - 실제 ProductHeader 컴포넌트 사용하되 상품명만 스켈레톤 */}
      <ProductHeader showSkeleton={true} />

      {/* Main Content */}
      <div className="flex-1">
        {/* 이미지 스켈레톤 */}
        <div className="relative w-full bg-gray-100 pt-14">
          <Skeleton className="aspect-square w-full" />
        </div>

        {/* 상품 정보 스켈레톤 */}
        <div className="px-6 mb-50">
          <div className="py-6 mb-6">
            {/* 상품명 */}
            <Skeleton className="h-8 w-3/4 mb-2" />

            {/* 상품 설명 */}
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />

            {/* 가격 */}
            <Skeleton className="h-6 w-1/2 mb-6" />
          </div>
        </div>
      </div>

      {/* 수량 조절 버튼 - 하단 고정 */}
      <div className="fixed bottom-36 left-1/2 transform -translate-x-1/2 w-full max-w-lg">
        <div
          className="flex items-center justify-center bg-white py-3 px-6 rounded-t-3xl"
          style={{ boxShadow: "0 -4px 6px -1px rgba(0, 0, 0, 0.1)" }}
        >
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-6 w-8 mx-8" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>

      {/* 장바구니 버튼 - 하단 고정 */}
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 w-full max-w-lg px-6 pb-10 pt-4 bg-white">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>

      {/* 푸터 - 실제 컴포넌트 사용 */}
      <Footer />

      {/* 하단 네비게이션은 실제 컴포넌트 사용 */}
      <BottomNavigation />
    </div>
  );
}
