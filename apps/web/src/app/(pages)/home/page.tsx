"use client";

import { useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/layout";
import {
  GreetingSection,
  PromoBanner,
  RecommendedMenu,
  NewsSection,
} from "@/components/home";
import { dummyNews, promoBanners } from "@/constants/dummyData";
import { Product } from "@/lib/services";

export default function HomePage() {
  const router = useRouter();

  const handleProductClick = (product: Product) => {
    router.push(`/menu/${product._id}`);
  };

  const handlePromoClick = (promotionId: string) => {
    router.push(`/promotion/${promotionId}`);
  };

  const handleNewsClick = (news: any) => {
    router.push(`/event/${news.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Main Content */}
      <div className="flex-1">
        {/* 상단 인사말 */}
        <GreetingSection />

        {/* 시즌 음료 프로모션 배너 */}
        <PromoBanner
          title={promoBanners.seasonal.title}
          subtitle={promoBanners.seasonal.subtitle}
          buttonText={promoBanners.seasonal.buttonText}
          imageUrl={promoBanners.seasonal.imageUrl}
          onButtonClick={() => handlePromoClick(promoBanners.seasonal.id)}
        />

        {/* 오늘의 추천 메뉴 */}
        <RecommendedMenu onProductClick={handleProductClick} />

        {/* 썸머 프로모션 배너 */}
        <PromoBanner
          title={promoBanners.summer.title}
          subtitle={promoBanners.summer.subtitle}
          buttonText={promoBanners.summer.buttonText}
          imageUrl={promoBanners.summer.imageUrl}
          onButtonClick={() => handlePromoClick(promoBanners.summer.id)}
        />

        {/* 새로운 소식 */}
        <NewsSection news={dummyNews} onNewsClick={handleNewsClick} />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
