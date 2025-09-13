"use client";

import { ReactNode } from "react";
import { BottomNavigation } from "@/components/layout";
import { useHydration } from "@/hooks";
import {
  ProductDetailSkeleton,
  PromotionEventDetailSkeleton,
} from "./Skeleton";

interface AsyncWrapperProps {
  loading: boolean;
  error: string | null;
  children: ReactNode;
  loadingMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  useSkeleton?: boolean; // 스켈레톤 사용 여부
  skeletonType?: "product" | "promotion-event"; // 스켈레톤 타입
}

export default function AsyncWrapper({
  loading,
  error,
  children,
  loadingMessage = "로딩 중...",
  errorMessage = "잠시 후 다시 시도해주세요.",
  onRetry,
  useSkeleton = false,
  skeletonType = "product",
}: AsyncWrapperProps) {
  const isClient = useHydration();

  // 서버에서는 항상 로딩 상태로 시작하여 하이드레이션 오류 방지
  if (!isClient) {
    if (useSkeleton) {
      return skeletonType === "promotion-event" ? (
        <PromotionEventDetailSkeleton />
      ) : (
        <ProductDetailSkeleton />
      );
    }
    return (
      <div className="min-h-screen bg-white flex flex-col pb-20">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800"></div>
            <div className="text-gray-600">{loadingMessage}</div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (loading) {
    if (useSkeleton) {
      return skeletonType === "promotion-event" ? (
        <PromotionEventDetailSkeleton />
      ) : (
        <ProductDetailSkeleton />
      );
    }
    return (
      <div className="min-h-screen bg-white flex flex-col pb-20">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800"></div>
            <div className="text-gray-600">{loadingMessage}</div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col pb-20">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-600 text-center">
            <p className="text-sm mb-2">{error}</p>
            <p className="text-xs mb-4">{errorMessage}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                다시 시도
              </button>
            )}
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return <>{children}</>;
}
