import {
  GreetingSection,
  PromoBanner,
  FeaturedPromo,
  RecommendedMenu,
  EventSection,
} from "@/components/home";
import { Product } from "@/types";
import { Event, Promotion } from "@/lib/services";
import { PromoBannerSkeleton } from "@/components/ui/Skeleton";

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
  // 최근 프로모션 (가장 최근 등록된 것)
  const latestPromotion = promotions.length > 0 ? promotions[0] : null;

  // 나머지 프로모션들 (최근 것 제외)
  const otherPromotions = promotions.slice(1);

  // 프로모션 렌더링 함수
  const renderPromotions = (promotionList: typeof promotions) => {
    return promotionList.map((promotion) => (
      <PromoBanner
        key={promotion._id}
        title={promotion.title}
        subtitle={promotion.description}
        buttonText="자세히 보기"
        imageUrl={promotion.promotionImg}
        onButtonClick={() => onPromoClick(promotion)}
      />
    ));
  };

  return (
    <div className="flex-1">
      {/* 상단 인사말 */}
      <GreetingSection />

      {/* 최근 프로모션 (전체 너비) */}
      {promotionsLoading ? (
        <PromoBannerSkeleton />
      ) : (
        latestPromotion && (
          <div className="mb-6">
            <FeaturedPromo
              promotion={latestPromotion}
              onButtonClick={() => onPromoClick(latestPromotion)}
            />
          </div>
        )
      )}

      {/* 콘텐츠 영역 */}
      <div className="px-6">
        {/* 오늘의 추천 메뉴 */}
        <RecommendedMenu onProductClick={onProductClick} />

        {/* 나머지 프로모션 배너들 */}
        {promotionsLoading ? (
          <PromoBannerSkeleton />
        ) : (
          otherPromotions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900">프로모션</h2>
              {renderPromotions(otherPromotions)}
            </div>
          )
        )}

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
