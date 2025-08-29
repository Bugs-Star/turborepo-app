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
