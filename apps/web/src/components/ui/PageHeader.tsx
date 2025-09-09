"use client";

import BackButton from "./BackButton";
import { useScrollPosition } from "@/hooks";
import { Skeleton } from "./Skeleton";

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: (() => void) | undefined;
  className?: string;
  variant?: "default" | "greeting";
  hideOnScroll?: boolean;
  showSkeleton?: boolean;
}

export default function PageHeader({
  title,
  showBackButton = true,
  onBackClick,
  className = "",
  variant = "default",
  hideOnScroll = false,
  showSkeleton = false,
}: PageHeaderProps) {
  const { isAtTop } = useScrollPosition();

  // hideOnScroll이 true일 때만 스크롤 감지 적용
  const shouldHide: boolean = Boolean(hideOnScroll && isAtTop);

  if (variant === "greeting") {
    return (
      <header
        className={`fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-lg z-50 flex items-center px-4 py-2 border-b border-gray-200 bg-white transition-transform duration-300 ${
          shouldHide ? "-translate-y-full" : "translate-y-0"
        } ${className}`}
      >
        {showBackButton && (
          <div className="flex-shrink-0">
            <BackButton onClick={onBackClick} />
          </div>
        )}
        <h1 className="flex-1 text-center text-lg font-semibold text-gray-900">
          {showSkeleton ? <Skeleton className="h-6 w-32 mx-auto" /> : title}
        </h1>
        {showBackButton && <div className="w-10 flex-shrink-0" />}
      </header>
    );
  }

  return (
    <header
      className={`fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-lg z-50 flex items-center px-4 py-2 bg-white border-b border-gray-100 transition-transform duration-300 ${
        shouldHide ? "-translate-y-full" : "translate-y-0"
      } ${className}`}
    >
      {showBackButton && (
        <div className="flex-shrink-0">
          <BackButton onClick={onBackClick} />
        </div>
      )}
      <h1 className="flex-1 text-center text-lg font-semibold text-gray-900">
        {showSkeleton ? <Skeleton className="h-6 w-32 mx-auto" /> : title}
      </h1>
      {/* 뒤로가기 버튼이 있을 때 오른쪽 공간을 맞추기 위한 더미 요소 */}
      {showBackButton && <div className="w-10 flex-shrink-0" />}
    </header>
  );
}
