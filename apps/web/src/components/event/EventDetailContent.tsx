import Image from "next/image";
import { Event } from "@/lib/services";

interface EventDetailContentProps {
  event: Event;
}

export default function EventDetailContent({ event }: EventDetailContentProps) {
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
      <div className="relative w-full bg-gray-100 pt-14">
        <Image
          src={event.eventImg}
          alt={event.title}
          width={0}
          height={0}
          sizes="100vw"
          className="w-full h-auto object-contain"
          onError={handleImageError}
        />
      </div>

      {/* 하단 상세 정보 섹션 - 흰색 배경 */}
      <div className="px-6 py-6 bg-white pb-20">
        {/* 이벤트 제목 */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h2>

        {/* 이벤트 기간 */}
        <p className="text-green-800 font-semibold text-sm mb-6">
          이벤트 기간: {formatDate(event.startDate)} ~{" "}
          {formatDate(event.endDate)}
        </p>

        {/* 상세 설명 */}
        <div className="text-gray-900 leading-relaxed space-y-4">
          <p className="whitespace-pre-line">{event.description}</p>
        </div>
      </div>
    </div>
  );
}
