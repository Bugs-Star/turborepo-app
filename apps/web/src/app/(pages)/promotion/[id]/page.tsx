"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useRef } from "react";
import { BottomNavigation, Footer } from "@/components/layout";
import { PageHeader, PromotionDetailContent, AsyncWrapper } from "@/components";
import { usePromotionDetailFetch, useAnalytics } from "@/hooks";

interface PromotionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PromotionDetailPage({
  params,
}: PromotionDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const {
    data: promotion,
    isLoading: loading,
    error,
  } = usePromotionDetailFetch(id);

  // 로거 훅
  const { trackScreenView, trackScreenDuration } = useAnalytics();

  // 중복 로깅 방지를 위한 ref
  const hasLoggedScreenView = useRef(false);
  const screenStartTime = useRef<string | null>(null);

  // 프로모션 제목을 사용한 스크린 뷰 로그 (프로모션 데이터 로드 후)
  useEffect(() => {
    if (promotion && !hasLoggedScreenView.current) {
      const screenName = `/promotion/${promotion.title.replace(/\s+/g, "-").toLowerCase()}`;
      trackScreenView(screenName);
      hasLoggedScreenView.current = true;

      // 체류 시간 추적 시작
      screenStartTime.current = new Date().toISOString();
    }
  }, [promotion, trackScreenView]);

  // 페이지 이탈 시 체류 시간 로그 생성
  useEffect(() => {
    return () => {
      if (screenStartTime.current && promotion) {
        const endTime = new Date().toISOString();
        const durationSeconds = Math.floor(
          (new Date(endTime).getTime() -
            new Date(screenStartTime.current).getTime()) /
            1000
        );

        const screenName = `/promotion/${promotion.title.replace(/\s+/g, "-").toLowerCase()}`;
        trackScreenDuration(
          screenName,
          durationSeconds,
          screenStartTime.current,
          endTime
        );
      }
    };
  }, [promotion, trackScreenDuration]);

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* Header - 로딩 중에도 표시 */}
      <PageHeader
        title={promotion?.title || "프로모션"}
        showBackButton={true}
        onBackClick={() => router.back()}
      />

      {/* Main Content */}
      <AsyncWrapper
        loading={loading}
        error={error?.message || null}
        useSkeleton={true}
        skeletonType="promotion-event"
      >
        {promotion && <PromotionDetailContent promotion={promotion} />}
      </AsyncWrapper>

      {/* Footer */}
      <Footer />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
