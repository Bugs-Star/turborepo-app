"use client";

import { useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/layout";
import {
  GreetingSection,
  PromoBanner,
  RecommendedMenu,
  EventSection,
} from "@/components/home";
import { Product, Event } from "@/lib/services";
import { usePromotionFetch, useEventFetch } from "@/hooks";

export default function HomePage() {
  const router = useRouter();

  // 프로모션 데이터 가져오기
  const { data: promotions = [], isLoading: promotionsLoading } =
    usePromotionFetch({ isActive: true });

  // 이벤트 데이터 가져오기
  const { data: events = [] } = useEventFetch({ isActive: true, limit: 5 });

  const handleProductClick = (product: Product) => {
    router.push(`/menu/${product._id}`);
  };

  const handlePromoClick = (promotionId: string) => {
    router.push(`/promotion/${promotionId}`);
  };

  const handleEventClick = (event: Event) => {
    router.push(`/event/${event._id}`);
  };

  // 위치별로 프로모션 분류
  const upPromotions = promotions.filter((promo) => promo.position === "up");
  const downPromotions = promotions.filter(
    (promo) => promo.position === "down"
  );

  // 프로모션 렌더링 함수
  const renderPromotions = (promotionList: typeof promotions) => {
    return promotionList.map((promotion) => (
      <PromoBanner
        key={promotion._id}
        title={promotion.title}
        subtitle={promotion.description}
        buttonText="자세히 보기"
        imageUrl={promotion.promotionImg}
        onButtonClick={() => handlePromoClick(promotion._id)}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Main Content */}
      <div className="flex-1">
        {/* 상단 인사말 */}
        <GreetingSection />

        {/* 상단 프로모션 배너들 */}
        {!promotionsLoading &&
          upPromotions.length > 0 &&
          renderPromotions(upPromotions)}

        {/* 오늘의 추천 메뉴 */}
        <RecommendedMenu onProductClick={handleProductClick} />

        {/* 하단 프로모션 배너들 */}
        {!promotionsLoading &&
          downPromotions.length > 0 &&
          renderPromotions(downPromotions)}

        {/* 이벤트 */}
        <EventSection events={events} onEventClick={handleEventClick} />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
