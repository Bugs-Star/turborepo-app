/**
 * 카페앱 사용자 행동 추적 훅 (스키마 v2)
 *
 * 스키마 기반으로 재구성된 분석 훅
 *
 * 사용법:
 * const { trackScreenView, trackProductClick } = useAnalytics();
 * trackScreenView("/home");
 */

import { useCallback } from "react";
import { logger } from "@/lib/logger";
import { Product, CartItemUI } from "@/types";
import { Promotion, Event } from "@/lib/services";

export const useAnalytics = () => {
  // === 화면 조회 이벤트 ===
  const trackScreenView = useCallback((screenName: string) => {
    // 이전 페이지 가져오기
    const previousScreen = sessionStorage.getItem("currentScreen") || null;

    // 현재 페이지 저장
    sessionStorage.setItem("currentScreen", screenName);

    logger.log("view_screen", {
      screenName: screenName,
      previousScreenName: previousScreen,
    } as any);
  }, []);

  // === 상품 관련 이벤트 ===
  const trackProductClick = useCallback(
    (product: Product, sourceComponent?: string) => {
      logger.log("click_interaction", {
        interactionType: "product_card",
        targetId: product._id,
        sourceComponent: sourceComponent,
        productCode: product.productName,
        price: product.price,
        category: product.category,
      });
    },
    []
  );

  const trackRecommendedProductClick = useCallback((product: Product) => {
    logger.log("click_interaction", {
      interactionType: "product_card",
      targetId: product._id,
      sourceComponent: "home_recommended_section",
      productCode: product.productName,
      price: product.price,
      category: product.category,
    });
  }, []);

  const trackProductView = useCallback((product: Product) => {
    logger.log("click_interaction", {
      interactionType: "product_card",
      targetId: product._id,
      sourceComponent: "product_detail_view",
      productCode: product.productName,
      price: product.price,
      category: product.category,
    });
  }, []);

  // === 카테고리 및 필터 이벤트 ===
  const trackCategoryClick = useCallback((category: string) => {
    logger.log("click_interaction", {
      interactionType: "category_link",
      targetId: category,
      sourceComponent: "category_filter",
      categoryName: category,
    });
  }, []);

  const trackSortOptionSelect = useCallback((sortOption: string) => {
    logger.log("click_interaction", {
      interactionType: "sort_option_select",
      targetId: sortOption,
      sourceComponent: "sort_filter",
      sortOption: sortOption,
    });
  }, []);

  // === 검색 이벤트 ===
  const trackSearchSubmit = useCallback(
    (searchKeyword: string, resultCount: number) => {
      logger.log("click_interaction", {
        interactionType: "search_submit",
        targetId: searchKeyword,
        sourceComponent: "search_bar",
        searchKeyword: searchKeyword,
        resultCount: resultCount,
      });
    },
    []
  );

  // === 장바구니 관련 이벤트 ===
  const trackAddToCart = useCallback((product: Product, quantity: number) => {
    logger.log("click_interaction", {
      interactionType: "button_add_to_cart",
      targetId: product._id,
      sourceComponent: "product_detail",
      productId: product._id,
      quantity: quantity,
      price: product.price,
    });
  }, []);

  const trackIncreaseQuantity = useCallback(
    (productId: string, currentQuantity: number) => {
      logger.log("click_interaction", {
        interactionType: "button_increase_quantity",
        targetId: productId,
        sourceComponent: "cart_item",
        productId: productId,
        currentQuantity: currentQuantity,
      });
    },
    []
  );

  const trackDecreaseQuantity = useCallback(
    (productId: string, currentQuantity: number) => {
      logger.log("click_interaction", {
        interactionType: "button_decrease_quantity",
        targetId: productId,
        sourceComponent: "cart_item",
        productId: productId,
        currentQuantity: currentQuantity,
      });
    },
    []
  );

  const trackRemoveItem = useCallback((item: CartItemUI) => {
    logger.log("click_interaction", {
      interactionType: "button_remove_item",
      targetId: item.id,
      sourceComponent: "cart_item",
      productId: item.id,
    });
  }, []);

  const trackCreateOrder = useCallback(
    (totalAmount: number, itemCount: number) => {
      logger.log("click_interaction", {
        interactionType: "button_create_order",
        targetId: "order",
        sourceComponent: "cart_page",
        totalAmount: totalAmount,
        itemCount: itemCount,
      });
    },
    []
  );

  // === 프로모션/이벤트 관련 이벤트 ===
  const trackPromotionClick = useCallback((promotion: Promotion) => {
    logger.log("click_interaction", {
      interactionType: "promotion_card",
      targetId: promotion._id,
      sourceComponent: "promotion_section",
      promotionId: promotion._id,
      promotionName: promotion.title,
    });
  }, []);

  const trackEventClick = useCallback((event: Event) => {
    logger.log("click_interaction", {
      interactionType: "event_card",
      targetId: event._id,
      sourceComponent: "event_section",
      eventId: event._id,
      eventName: event.title,
    });
  }, []);

  const trackEventParticipate = useCallback((eventId: string) => {
    logger.log("click_interaction", {
      interactionType: "button_event_participate",
      targetId: eventId,
      sourceComponent: "event_detail",
      eventId: eventId,
    });
  }, []);

  const trackCouponDownload = useCallback(
    (promotionId: string, couponCode: string) => {
      logger.log("click_interaction", {
        interactionType: "button_coupon_download",
        targetId: promotionId,
        sourceComponent: "promotion_detail",
        promotionId: promotionId,
        couponCode: couponCode,
      });
    },
    []
  );

  // === 광고 배너 이벤트 ===
  const trackAdBannerClick = useCallback((adId: string, campaignId: string) => {
    logger.log("click_interaction", {
      interactionType: "ad_banner",
      targetId: adId,
      sourceComponent: "ad_section",
      adId: adId,
      campaignId: campaignId,
    });
  }, []);

  // === 네비게이션 이벤트 ===
  const trackNavLinkClick = useCallback(
    (linkText: string, targetUrl: string) => {
      logger.log("click_interaction", {
        interactionType: "nav_link",
        sourceComponent: "navigation",
        linkText: linkText,
        targetUrl: targetUrl,
      });
    },
    []
  );

  // === 기타 상호작용 이벤트 ===
  const trackViewMore = useCallback((pageNumber: number) => {
    logger.log("click_interaction", {
      interactionType: "button_view_more",
      targetId: `page_${pageNumber}`,
      sourceComponent: "product_list",
      pageNumber: pageNumber,
    });
  }, []);

  const trackPopupClose = useCallback((popupId: string) => {
    logger.log("click_interaction", {
      interactionType: "button_popup_close",
      targetId: popupId,
      sourceComponent: "popup",
      popupId: popupId,
    });
  }, []);

  // === 사용자 인증 이벤트 ===
  const trackLoginSubmit = useCallback(() => {
    logger.log("click_interaction", {
      interactionType: "button_login_submit",
      targetId: "login",
      sourceComponent: "login_form",
    });
  }, []);

  const trackSignupSubmit = useCallback(() => {
    logger.log("click_interaction", {
      interactionType: "button_signup_submit",
      targetId: "signup",
      sourceComponent: "signup_form",
    });
  }, []);

  const trackLogout = useCallback(() => {
    logger.log("click_interaction", {
      interactionType: "button_logout",
      targetId: "logout",
      sourceComponent: "profile_menu",
    });
  }, []);

  const trackProfileEditClick = useCallback(() => {
    logger.log("click_interaction", {
      interactionType: "button_profile_edit",
      targetId: "profile_edit",
      sourceComponent: "profile_menu",
    });
  }, []);

  const trackOrderHistoryClick = useCallback(() => {
    logger.log("click_interaction", {
      interactionType: "button_order_history",
      targetId: "order_history",
      sourceComponent: "profile_menu",
    });
  }, []);

  // === 로그인/회원가입 실패 이벤트 (즉시 전송) ===
  const trackLoginFailure = useCallback(
    (email: string, errorMessage: string) => {
      logger.log("click_interaction", {
        interactionType: "login_failure",
        targetId: "login",
        sourceComponent: "login_form",
        email: email,
        errorMessage: errorMessage,
      });
    },
    []
  );

  const trackSignupFailure = useCallback(
    (email: string, name: string, errorMessage: string) => {
      logger.log("click_interaction", {
        interactionType: "signup_failure",
        targetId: "signup",
        sourceComponent: "signup_form",
        email: email,
        name: name,
        errorMessage: errorMessage,
      });
    },
    []
  );

  const trackSignupAttempt = useCallback((email: string, name: string) => {
    logger.log("click_interaction", {
      interactionType: "signup_attempt",
      targetId: "signup",
      sourceComponent: "signup_form",
      email: email,
      name: name,
    });
  }, []);

  const trackSignupSuccess = useCallback((email: string, name: string) => {
    logger.log("click_interaction", {
      interactionType: "signup_success",
      targetId: "signup",
      sourceComponent: "signup_form",
      email: email,
      name: name,
    });
  }, []);

  const trackLoginLinkClick = useCallback(() => {
    logger.log("click_interaction", {
      interactionType: "login_link",
      targetId: "login_link",
      sourceComponent: "signup_form",
    });
  }, []);

  return {
    trackScreenView,
    trackProductClick,
    trackRecommendedProductClick,
    trackProductView,
    trackCategoryClick,
    trackSortOptionSelect,
    trackSearchSubmit,
    trackAddToCart,
    trackIncreaseQuantity,
    trackDecreaseQuantity,
    trackRemoveItem,
    trackCreateOrder,
    trackPromotionClick,
    trackEventClick,
    trackEventParticipate,
    trackCouponDownload,
    trackAdBannerClick,
    trackNavLinkClick,
    trackViewMore,
    trackPopupClose,
    trackLoginSubmit,
    trackSignupSubmit,
    trackLogout,
    trackProfileEditClick,
    trackOrderHistoryClick,
    trackLoginFailure,
    trackSignupFailure,
    trackSignupAttempt,
    trackSignupSuccess,
    trackLoginLinkClick,
  };
};
