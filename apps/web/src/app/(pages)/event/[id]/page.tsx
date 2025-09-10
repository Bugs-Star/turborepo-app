"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useRef } from "react";
import { BottomNavigation, Footer } from "@/components/layout";
import { PageHeader, EventDetailContent, AsyncWrapper } from "@/components";
import { useEventDetailFetch, useAnalytics } from "@/hooks";

interface EventDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { data: event, isLoading, error } = useEventDetailFetch(id);

  // 로거 훅
  const { trackScreenView } = useAnalytics();

  // 중복 로깅 방지를 위한 ref
  const hasLoggedScreenView = useRef(false);

  // 이벤트 제목을 사용한 스크린 뷰 로그 (이벤트 데이터 로드 후)
  useEffect(() => {
    if (event && !hasLoggedScreenView.current) {
      trackScreenView(
        `/event/${event.title.replace(/\s+/g, "-").toLowerCase()}`
      );
      hasLoggedScreenView.current = true;
    }
  }, [event, trackScreenView]);

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* Header - 로딩 중에도 표시 */}
      <PageHeader
        title={event?.title || "이벤트"}
        showBackButton={true}
        onBackClick={() => router.back()}
      />

      {/* Main Content */}
      <AsyncWrapper loading={isLoading} error={error?.message || null}>
        <EventDetailContent event={event!} />
      </AsyncWrapper>

      {/* Footer */}
      <Footer />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
