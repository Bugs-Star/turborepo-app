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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3E이미지%3C/text%3E%3C/svg%3E";
  };

  return (
    <div className="flex-1">
      {/* 상단 이미지 섹션 - 상품 상세 페이지와 동일한 스타일 적용 */}
      <div className="relative w-full bg-gray-100 pt-16">
        <Image
          src={promotion.promotionImg}
          alt={promotion.title}
          width={0}
          height={0}
          sizes="100vw"
          className="w-full h-auto object-contain"
          onError={handleImageError}
        />
        {/* 그라데이션 오버레이 요소 */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.1) 20%, rgba(255, 255, 255, 0.3) 40%, rgba(255, 255, 255, 0.7) 70%, rgba(255, 255, 255, 1) 100%)",
          }}
        ></div>
      </div>

      {/* 하단 상세 정보 섹션 - 흰색 배경 */}
      <div className="px-6 py-6 bg-white">
        {/* 프로모션 제목 */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {promotion.title}
        </h2>

        {/* 이벤트 기간 */}
        <p className="text-green-800 font-semibold text-sm mb-6">
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
