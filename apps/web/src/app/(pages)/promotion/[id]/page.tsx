"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useRef } from "react";
import { BottomNavigation } from "@/components/layout";
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
  const { trackScreenView } = useAnalytics();

  // 중복 로깅 방지를 위한 ref
  const hasLoggedScreenView = useRef(false);

  // 프로모션 제목을 사용한 스크린 뷰 로그 (프로모션 데이터 로드 후)
  useEffect(() => {
    if (promotion && !hasLoggedScreenView.current) {
      trackScreenView(
        `/promotion/${promotion.title.replace(/\s+/g, "-").toLowerCase()}`
      );
      hasLoggedScreenView.current = true;
    }
  }, [promotion, trackScreenView]);

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* Header - 로딩 중에도 표시 */}
      <PageHeader
        title={promotion?.title || "프로모션"}
        showBackButton={true}
        onBackClick={() => router.back()}
      />

      {/* Main Content */}
      <AsyncWrapper loading={loading} error={error?.message || null}>
        {promotion && <PromotionDetailContent promotion={promotion} />}
      </AsyncWrapper>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
