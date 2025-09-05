"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { BottomNavigation } from "@/components/layout";
import { HomeContent } from "@/components/home";
import {
  usePromotionFetch,
  useEventFetch,
  useHomeActions,
  useAnalytics,
} from "@/hooks";
import { Product } from "@/types";
import { Event, Promotion } from "@/lib/services";

export default function HomePage() {
  // 프로모션 데이터 가져오기
  const { data: promotions = [], isLoading: promotionsLoading } =
    usePromotionFetch({ isActive: true });

  // 이벤트 데이터 가져오기
  const { data: events = [], isLoading: eventsLoading } = useEventFetch({
    isActive: true,
    // limit 제거 - 모든 활성 이벤트를 가져와서 클라이언트에서 3개씩 표시
  });

  const { handleProductClick, handlePromoClick, handleEventClick } =
    useHomeActions();

  // 화면 조회 로거
  const { trackScreenView } = useAnalytics();

  // 중복 로깅 방지를 위한 ref
  const hasLoggedScreenView = useRef(false);

  // 페이지 로드 시 화면 조회 로그 (브라우저에서만 실행, 한 번만)
  useEffect(() => {
    if (typeof window !== "undefined" && !hasLoggedScreenView.current) {
      trackScreenView("/home");
      hasLoggedScreenView.current = true;
    }
  }, [trackScreenView]);

  // 메모이제이션된 props 객체 - 직접 핸들러 전달
  const homeContentProps = useMemo(
    () => ({
      promotions,
      events,
      promotionsLoading,
      eventsLoading,
      onProductClick: handleProductClick,
      onPromoClick: handlePromoClick,
      onEventClick: handleEventClick,
    }),
    [
      promotions,
      events,
      promotionsLoading,
      eventsLoading,
      handleProductClick,
      handlePromoClick,
      handleEventClick,
    ]
  );

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* Main Content */}
      <HomeContent {...homeContentProps} />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
