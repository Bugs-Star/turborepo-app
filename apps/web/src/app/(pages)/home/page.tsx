"use client";

import { useEffect, useRef } from "react";
import { BottomNavigation } from "@/components/layout";
import { HomeContent } from "@/components/home";
import {
  usePromotionFetch,
  useEventFetch,
  useHomeActions,
  useAnalytics,
} from "@/hooks";

export default function HomePage() {
  // 프로모션 데이터 가져오기
  const { data: promotions = [], isLoading: promotionsLoading } =
    usePromotionFetch({ isActive: true });

  // 이벤트 데이터 가져오기
  const { data: events = [], isLoading: eventsLoading } = useEventFetch({
    isActive: true,
    limit: 5,
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

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* Main Content */}
      <HomeContent
        promotions={promotions}
        events={events}
        promotionsLoading={promotionsLoading}
        eventsLoading={eventsLoading}
        onProductClick={handleProductClick}
        onPromoClick={handlePromoClick}
        onEventClick={handleEventClick}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
