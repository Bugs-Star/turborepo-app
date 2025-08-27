import Image from "next/image";
import { Promotion } from "@/lib/services";

interface PromotionDetailContentProps {
  promotion: Promotion;
}

export default function PromotionDetailContent({
  promotion,
}: PromotionDetailContentProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  return (
    <div className="flex-1">
      {/* 상단 이미지 섹션 - 이미지를 배경으로 사용 */}
      <div className="h-64 relative">
        <Image
          src={promotion.promotionImg}
          alt={promotion.title}
          fill
          className="object-cover"
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
          <p>{promotion.description}</p>
        </div>
      </div>
    </div>
  );
}
