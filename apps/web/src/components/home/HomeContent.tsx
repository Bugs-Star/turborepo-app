import {
  GreetingSection,
  PromotionSection,
  HeroBanner,
  RecommendedMenu,
  EventSection,
} from "@/components/home";
import { Product } from "@/types";
import { Event, Promotion } from "@/lib/services";

interface HomeContentProps {
  promotions: Promotion[];
  events: Event[];
  promotionsLoading: boolean;
  eventsLoading: boolean;
  onProductClick: (product: Product) => void;
  onPromoClick: (promotion: Promotion) => void;
  onEventClick: (event: Event) => void;
}

export default function HomeContent({
  promotions,
  events,
  promotionsLoading,
  eventsLoading,
  onProductClick,
  onPromoClick,
  onEventClick,
}: HomeContentProps) {
  return (
    <div className="flex-1">
      {/* 상단 인사말 */}
      <GreetingSection />

      {/* 최상단 히어로 배너 (고정) */}
      <div className="mb-6">
        <HeroBanner />
      </div>

      {/* 콘텐츠 영역 */}
      <div className="px-6">
        {/* 오늘의 추천 메뉴 */}
        <RecommendedMenu onProductClick={onProductClick} />

        {/* 프로모션 섹션 */}
        <PromotionSection
          promotions={promotions}
          loading={promotionsLoading}
          onPromoClick={onPromoClick}
        />

        {/* 이벤트 */}
        <EventSection
          events={events}
          loading={eventsLoading}
          onEventClick={onEventClick}
        />
      </div>
    </div>
  );
}
