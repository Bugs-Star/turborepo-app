"use client";

import { ReactNode } from "react";
import { useHydration } from "@/hooks";

interface HydrationWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  showFallback?: boolean;
}

export const HydrationWrapper = ({
  children,
  fallback = null,
  showFallback = true,
}: HydrationWrapperProps) => {
  const isHydrated = useHydration();

  if (!isHydrated && showFallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// 하이드레이션 완료 후에만 렌더링하는 컴포넌트
export const ClientOnly = ({ children, fallback }: HydrationWrapperProps) => {
  return <HydrationWrapper fallback={fallback}>{children}</HydrationWrapper>;
};
