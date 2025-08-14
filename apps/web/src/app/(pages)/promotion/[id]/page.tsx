"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { BottomNavigation } from "@/components/layout";
import { PageHeader } from "@/components/ui";
import { promoBanners } from "@/constants/dummyData";
import { notFound } from "next/navigation";

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

  // 프로모션 데이터 찾기
  const promotion = Object.values(promoBanners).find(
    (promo) => promo.id === id
  );

  if (!promotion) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* Header */}
      <PageHeader
        title={promotion.title}
        showBackButton={true}
        onBackClick={() => router.back()}
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* 상단 이미지 섹션 - 이미지를 배경으로 사용 */}
        <div className="h-64 relative">
          <img
            src={promotion.imageUrl}
            alt={promotion.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 하단 상세 정보 섹션 - 흰색 배경 */}
        <div className="px-6 py-6 bg-white">
          {/* 프로모션 제목 */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {promotion.title}
          </h2>

          {/* 이벤트 기간 */}
          <p className="text-green-700 font-semibold text-sm mb-6">
            이벤트 기간: {formatDate(promotion.startDate)} ~{" "}
            {formatDate(promotion.endDate)}
          </p>

          {/* 상세 설명 */}
          <div className="text-gray-900 leading-relaxed space-y-4">
            <p>{promotion.detailedDescription}</p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
