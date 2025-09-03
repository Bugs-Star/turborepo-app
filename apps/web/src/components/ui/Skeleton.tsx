import { cn } from "@/utils/commonUtils";

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* 이미지 스켈레톤 */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>

      {/* 정보 스켈레톤 */}
      <div className="p-3">
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
        <div
          key={index}
          className="flex-shrink-0 w-32 bg-white rounded-lg shadow-sm border border-gray-200"
        >
          {/* 이미지 스켈레톤 */}
          <div className="w-32 h-32 rounded-t-lg overflow-hidden">
            <Skeleton className="w-full h-full" />
          </div>
          {/* 정보 스켈레톤 */}
          <div className="p-3">
            <Skeleton className="h-4 mb-1 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
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
