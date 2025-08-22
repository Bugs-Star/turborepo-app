/**
 * 카페앱 사용자 행동 추적 훅
 *
 * 현재 홈페이지에서 사용 중인 로거 함수들
 *
 * 사용법:
 * const { trackPageView, trackRecommendedProductClick } = useAnalytics();
 * trackPageView("/home");
 */

import { useCallback } from "react";
import { logger } from "@/lib/logger";
import { Product } from "@/types";
import { Promotion, Event } from "@/lib/services";
import { CartItemUI } from "@/types/cart";

export const useAnalytics = () => {
  // === 유틸리티 함수 ===
  const getPageInfo = useCallback(
    () => ({
      page: typeof window !== "undefined" ? window.location.pathname : "",
      page_title: typeof document !== "undefined" ? document.title : "",
      referrer: typeof document !== "undefined" ? document.referrer : "",
    }),
    []
  );

  // === 상품 관련 이벤트 ===
  const createProductLogData = useCallback(
    (product: Product) => ({
      product_id: product._id,
      product_name: product.productName,
      product_price: product.price,
      category: product.category,
      ...getPageInfo(),
    }),
    [getPageInfo]
  );

  const trackRecommendedProductClick = useCallback(
    (product: Product) => {
      logger.log("recommended_product_click", createProductLogData(product));
    },
    [createProductLogData]
  );

  // === 메뉴 페이지 전용 이벤트 ===
  const trackProductClick = useCallback(
    (product: Product, activeCategory: string) => {
      logger.log("product_click", {
        ...createProductLogData(product),
        filter_category: activeCategory,
      });
    },
    [createProductLogData]
  );

  const trackFilterChange = useCallback(
    (category: string, previousCategory?: string) => {
      logger.log("filter_change", {
        filter_category: category,
        previous_category: previousCategory,
        ...getPageInfo(),
      });
    },
    [getPageInfo]
  );

  const trackProductView = useCallback(
    (product: Product, activeCategory: string) => {
      logger.log("product_view", {
        ...createProductLogData(product),
        filter_category: activeCategory,
      });
    },
    [createProductLogData]
  );

  // === 상품 상세 페이지 전용 이벤트 ===
  const trackProductDetailView = useCallback(
    (product: Product) => {
      logger.log("product_view", {
        ...createProductLogData(product),
      });
    },
    [createProductLogData]
  );

  const trackCartAdd = useCallback(
    (product: Product, quantity: number) => {
      logger.log("cart_add", {
        ...createProductLogData(product),
        quantity: quantity,
        cart_total: product.price * quantity,
      });
    },
    [createProductLogData]
  );

  // === 장바구니 페이지 전용 이벤트 ===
  const trackCartView = useCallback(
    (itemCount: number, totalAmount: number) => {
      logger.log("cart_view", {
        ...getPageInfo(),
        cart_item_count: itemCount,
        cart_total: totalAmount,
      });
    },
    [getPageInfo]
  );

  const trackCartRemove = useCallback(
    (item: CartItemUI) => {
      logger.log("cart_remove", {
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        ...getPageInfo(),
      });
    },
    [getPageInfo]
  );

  const trackOrderInitiate = useCallback(
    (totalAmount: number, itemCount: number, paymentMethod?: string) => {
      logger.log("order_initiate", {
        order_total: totalAmount,
        cart_item_count: itemCount,
        payment_method: paymentMethod,
        ...getPageInfo(),
      });
    },
    [getPageInfo]
  );

  // === 프로모션/이벤트 관련 이벤트 ===
  const trackPromotionView = useCallback(
    (promotion: Promotion) => {
      logger.log("promotion_view", {
        promotion_id: promotion._id,
        promotion_name: promotion.title,
        ...getPageInfo(),
      });
    },
    [getPageInfo]
  );

  const trackEventView = useCallback(
    (event: Event) => {
      logger.log("event_view", {
        event_id: event._id,
        event_name: event.title,
        ...getPageInfo(),
      });
    },
    [getPageInfo]
  );

  // === 프로필 페이지 전용 이벤트 ===
  const trackProfileEditClick = useCallback(() => {
    logger.log("profile_edit_click", {
      ...getPageInfo(),
    });
  }, [getPageInfo]);

  const trackOrderHistoryClick = useCallback(() => {
    logger.log("order_history_click", {
      ...getPageInfo(),
    });
  }, [getPageInfo]);

  const trackLogout = useCallback(() => {
    logger.log("logout", {
      ...getPageInfo(),
    });
  }, [getPageInfo]);

  // === 페이지 뷰 이벤트 ===
  const trackPageView = useCallback((pageName?: string) => {
    logger.log("page_view", {
      page:
        pageName ||
        (typeof window !== "undefined" ? window.location.pathname : ""),
      page_title: typeof document !== "undefined" ? document.title : "",
      referrer: typeof document !== "undefined" ? document.referrer : "",
    });
  }, []);

  return {
    // 상품 관련
    trackRecommendedProductClick,
    trackProductClick,
    trackProductView,
    trackProductDetailView,

    // 장바구니 관련
    trackCartAdd,
    trackCartView,
    trackCartRemove,
    trackOrderInitiate,

    // 필터 관련
    trackFilterChange,

    // 프로모션/이벤트 관련
    trackPromotionView,
    trackEventView,

    // 프로필 페이지 관련
    trackProfileEditClick,
    trackOrderHistoryClick,
    trackLogout,

    // 페이지 관련
    trackPageView,
  };
};
