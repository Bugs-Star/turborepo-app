import {
  GreetingSection,
  PromoBanner,
  RecommendedMenu,
  EventSection,
} from "@/components/home";
import { Product, Event } from "@/lib/services";

interface HomeContentProps {
  promotions: any[];
  events: any[];
  promotionsLoading: boolean;
  onProductClick: (product: Product) => void;
  onPromoClick: (promotionId: string) => void;
  onEventClick: (event: Event) => void;
}

export default function HomeContent({
  promotions,
  events,
  promotionsLoading,
  onProductClick,
  onPromoClick,
  onEventClick,
}: HomeContentProps) {
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
        onButtonClick={() => onPromoClick(promotion._id)}
      />
    ));
  };

  return (
    <div className="flex-1">
      {/* 상단 인사말 */}
      <GreetingSection />

      {/* 상단 프로모션 배너들 */}
      {!promotionsLoading &&
        upPromotions.length > 0 &&
        renderPromotions(upPromotions)}

      {/* 오늘의 추천 메뉴 */}
      <RecommendedMenu onProductClick={onProductClick} />

      {/* 하단 프로모션 배너들 */}
      {!promotionsLoading &&
        downPromotions.length > 0 &&
        renderPromotions(downPromotions)}

      {/* 이벤트 */}
      <EventSection events={events} onEventClick={onEventClick} />
    </div>
  );
}
