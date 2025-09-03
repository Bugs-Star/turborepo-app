"use client";

import { ReactNode } from "react";
import { useLoading } from "@/hooks";

interface LoadingIndicatorProps {
  loadingKey?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const LoadingIndicator = ({
  loadingKey,
  children,
  fallback,
}: LoadingIndicatorProps) => {
  // 항상 useLoading 호출 (loadingKey가 없으면 빈 문자열 전달)
  const { isLoading } = useLoading(loadingKey || "");

  if (isLoading) {
    return (
      <>
        {fallback || (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <span className="ml-2 text-sm text-gray-600">로딩 중...</span>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
};

// 특정 로딩 키에 대한 인디케이터
export const LoadingSpinner = ({ loadingKey }: { loadingKey: string }) => {
  // 항상 useLoading 호출 (loadingKey가 없으면 빈 문자열 전달)
  const { isLoading } = useLoading(loadingKey || "");

  if (!isLoading) return null;

  return (
    <div className="flex items-center justify-center p-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
    </div>
  );
};
