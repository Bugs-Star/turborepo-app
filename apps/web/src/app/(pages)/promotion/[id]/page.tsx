"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { BottomNavigation } from "@/components/layout";
import { PageHeader, PromotionDetailContent, AsyncWrapper } from "@/components";
import { usePromotionDetailFetch } from "@/hooks";

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
  const { promotion, loading, error } = usePromotionDetailFetch(id);

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* Header - 로딩 중에도 표시 */}
      <PageHeader
        title={promotion?.title || "프로모션"}
        showBackButton={true}
        onBackClick={() => router.back()}
      />

      {/* Main Content - AsyncWrapper로 로딩/에러 처리 */}
      <AsyncWrapper
        loading={loading}
        error={error}
        loadingMessage="프로모션 정보를 불러오는 중..."
        errorMessage="프로모션 정보를 불러오는데 실패했습니다."
      >
        {promotion && <PromotionDetailContent promotion={promotion} />}
      </AsyncWrapper>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
