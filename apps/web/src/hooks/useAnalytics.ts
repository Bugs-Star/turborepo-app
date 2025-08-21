/**
 * 카페앱 사용자 행동 추적 훅
 *
 * 현재 홈페이지에서 사용 중인 로거 함수들
 *
 * 사용법:
 * const { trackPageView, trackRecommendedProductClick } = useAnalytics();
 * trackPageView("/home");
 */

import { logger } from "@/lib/logger";
import { Product } from "@/types";
import { Promotion, Event } from "@/lib/services";

export const useAnalytics = () => {
  // === 상품 관련 이벤트 ===
  const createProductLogData = (product: Product) => ({
    product_id: product._id,
    product_name: product.productName,
    product_price: product.price,
    category: product.category,
    page: typeof window !== "undefined" ? window.location.pathname : "",
  });

  const trackRecommendedProductClick = (product: Product) => {
    logger.log("recommended_product_click", createProductLogData(product));
  };

  // === 프로모션/이벤트 관련 이벤트 ===
  const trackPromotionView = (promotion: Promotion) => {
    logger.log("promotion_view", {
      promotion_id: promotion._id,
      promotion_name: promotion.title,
      page: typeof window !== "undefined" ? window.location.pathname : "",
    });
  };

  const trackEventView = (event: Event) => {
    logger.log("event_view", {
      event_id: event._id,
      event_name: event.title,
      page: typeof window !== "undefined" ? window.location.pathname : "",
    });
  };

  // === 페이지 뷰 이벤트 ===
  const trackPageView = (pageName?: string) => {
    logger.log("page_view", {
      page:
        pageName ||
        (typeof window !== "undefined" ? window.location.pathname : ""),
      page_title: typeof document !== "undefined" ? document.title : "",
      referrer: typeof document !== "undefined" ? document.referrer : "",
    });
  };

  return {
    // 상품 관련
    trackRecommendedProductClick,

    // 프로모션/이벤트 관련
    trackPromotionView,
    trackEventView,

    // 페이지 관련
    trackPageView,
  };
};
