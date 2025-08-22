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
import { AsyncWrapper } from "@/components/ui";

export default function HomePage() {
  // 프로모션 데이터 가져오기
  const { data: promotions = [], isLoading: promotionsLoading } =
    usePromotionFetch({ isActive: true });

  // 이벤트 데이터 가져오기
  const { data: events = [] } = useEventFetch({ isActive: true, limit: 5 });

  const { handleProductClick, handlePromoClick, handleEventClick } =
    useHomeActions();

  // 페이지 뷰 로거
  const { trackPageView } = useAnalytics();

  // 중복 로깅 방지를 위한 ref
  const hasLoggedPageView = useRef(false);

  // 페이지 로드 시 페이지 뷰 로그 (브라우저에서만 실행, 한 번만)
  useEffect(() => {
    if (typeof window !== "undefined" && !hasLoggedPageView.current) {
      trackPageView("/home");
      hasLoggedPageView.current = true;
    }
  }, [trackPageView]);

  return (
    <AsyncWrapper
      loading={promotionsLoading}
      error={null}
      loadingMessage="홈 화면을 불러오는 중..."
    >
      <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
        {/* Main Content */}
        <HomeContent
          promotions={promotions}
          events={events}
          promotionsLoading={promotionsLoading}
          onProductClick={handleProductClick}
          onPromoClick={handlePromoClick}
          onEventClick={handleEventClick}
        />

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </AsyncWrapper>
  );
}
