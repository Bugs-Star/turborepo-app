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
import { Product } from "@/types";
import { Promotion, Event } from "@/lib/services";
import { CartItemUI } from "@/types/cart";

export const useAnalytics = () => {
  // === 화면 조회 이벤트 ===
  const trackScreenView = useCallback(
    (screenName: string, previousScreen?: string) => {
      logger.log("view_screen", {
        screen_name: screenName,
        previous_screen_name: previousScreen,
      });
    },
    []
  );

  // === 상품 관련 이벤트 ===
  const trackProductClick = useCallback(
    (product: Product, sourceComponent?: string) => {
      logger.log("click_interaction", {
        interaction_type: "product_card",
        target_id: product._id,
        target_name: product.productName,
        source_component: sourceComponent,
        productCode: product._id,
        productName: product.productName,
        price: product.price,
        category: product.category,
      });
    },
    []
  );

  const trackRecommendedProductClick = useCallback((product: Product) => {
    logger.log("click_interaction", {
      interaction_type: "product_card",
      target_id: product._id,
      target_name: product.productName,
      source_component: "home_recommended_section",
      productCode: product._id,
      productName: product.productName,
      price: product.price,
      category: product.category,
    });
  }, []);

  const trackProductView = useCallback((product: Product) => {
    logger.log("click_interaction", {
      interaction_type: "product_card",
      target_id: product._id,
      target_name: product.productName,
      source_component: "product_detail_view",
      productCode: product._id,
      productName: product.productName,
      price: product.price,
      category: product.category,
    });
  }, []);

  // === 카테고리 및 필터 이벤트 ===
  const trackCategoryClick = useCallback((category: string) => {
    logger.log("click_interaction", {
      interaction_type: "category_link",
      target_id: category,
      target_name: category,
      source_component: "category_filter",
      categoryName: category,
    });
  }, []);

  const trackSortOptionSelect = useCallback((sortOption: string) => {
    logger.log("click_interaction", {
      interaction_type: "sort_option_select",
      target_id: sortOption,
      target_name: sortOption,
      source_component: "sort_filter",
      sortOption: sortOption,
    });
  }, []);

  // === 검색 이벤트 ===
  const trackSearchSubmit = useCallback(
    (searchKeyword: string, resultCount: number) => {
      logger.log("click_interaction", {
        interaction_type: "search_submit",
        target_id: searchKeyword,
        target_name: searchKeyword,
        source_component: "search_bar",
        searchKeyword: searchKeyword,
        resultCount: resultCount,
      });
    },
    []
  );

  // === 장바구니 관련 이벤트 ===
  const trackAddToCart = useCallback((product: Product, quantity: number) => {
    logger.log("click_interaction", {
      interaction_type: "button_add_to_cart",
      target_id: product._id,
      target_name: product.productName,
      source_component: "product_detail",
      productId: product._id,
      quantity: quantity,
      price: product.price,
    });
  }, []);

  const trackIncreaseQuantity = useCallback(
    (productId: string, currentQuantity: number) => {
      logger.log("click_interaction", {
        interaction_type: "button_increase_quantity",
        target_id: productId,
        target_name: "수량 증가",
        source_component: "cart_item",
        productId: productId,
        currentQuantity: currentQuantity,
      });
    },
    []
  );

  const trackDecreaseQuantity = useCallback(
    (productId: string, currentQuantity: number) => {
      logger.log("click_interaction", {
        interaction_type: "button_decrease_quantity",
        target_id: productId,
        target_name: "수량 감소",
        source_component: "cart_item",
        productId: productId,
        currentQuantity: currentQuantity,
      });
    },
    []
  );

  const trackRemoveItem = useCallback((item: CartItemUI) => {
    logger.log("click_interaction", {
      interaction_type: "button_remove_item",
      target_id: item.id,
      target_name: item.name,
      source_component: "cart_item",
      productId: item.id,
    });
  }, []);

  const trackCreateOrder = useCallback(
    (totalAmount: number, itemCount: number) => {
      logger.log("click_interaction", {
        interaction_type: "button_create_order",
        target_id: "order",
        target_name: "주문하기",
        source_component: "cart_page",
        totalAmount: totalAmount,
        itemCount: itemCount,
      });
    },
    []
  );

  // === 프로모션/이벤트 관련 이벤트 ===
  const trackPromotionClick = useCallback((promotion: Promotion) => {
    logger.log("click_interaction", {
      interaction_type: "promotion_card",
      target_id: promotion._id,
      target_name: promotion.title,
      source_component: "promotion_section",
      promotionId: promotion._id,
      promotionName: promotion.title,
    });
  }, []);

  const trackEventClick = useCallback((event: Event) => {
    logger.log("click_interaction", {
      interaction_type: "event_card",
      target_id: event._id,
      target_name: event.title,
      source_component: "event_section",
      eventId: event._id,
      eventName: event.title,
    });
  }, []);

  const trackEventParticipate = useCallback((eventId: string) => {
    logger.log("click_interaction", {
      interaction_type: "button_event_participate",
      target_id: eventId,
      target_name: "참여하기",
      source_component: "event_detail",
      eventId: eventId,
    });
  }, []);

  const trackCouponDownload = useCallback(
    (promotionId: string, couponCode: string) => {
      logger.log("click_interaction", {
        interaction_type: "button_coupon_download",
        target_id: promotionId,
        target_name: "쿠폰 받기",
        source_component: "promotion_detail",
        promotionId: promotionId,
        couponCode: couponCode,
      });
    },
    []
  );

  // === 광고 배너 이벤트 ===
  const trackAdBannerClick = useCallback((adId: string, campaignId: string) => {
    logger.log("click_interaction", {
      interaction_type: "ad_banner",
      target_id: adId,
      target_name: "광고 배너",
      source_component: "ad_section",
      adId: adId,
      campaignId: campaignId,
    });
  }, []);

  // === 네비게이션 이벤트 ===
  const trackNavLinkClick = useCallback(
    (linkText: string, targetUrl: string) => {
      logger.log("click_interaction", {
        interaction_type: "nav_link",
        target_id: targetUrl,
        target_name: linkText,
        source_component: "navigation",
        linkText: linkText,
        targetUrl: targetUrl,
      });
    },
    []
  );

  // === 기타 상호작용 이벤트 ===
  const trackViewMore = useCallback((pageNumber: number) => {
    logger.log("click_interaction", {
      interaction_type: "button_view_more",
      target_id: `page_${pageNumber}`,
      target_name: "더보기",
      source_component: "product_list",
      pageNumber: pageNumber,
    });
  }, []);

  const trackPopupClose = useCallback((popupId: string) => {
    logger.log("click_interaction", {
      interaction_type: "button_popup_close",
      target_id: popupId,
      target_name: "닫기",
      source_component: "popup",
      popupId: popupId,
    });
  }, []);

  // === 사용자 인증 이벤트 ===
  const trackLoginSubmit = useCallback(() => {
    logger.log("click_interaction", {
      interaction_type: "button_login_submit",
      target_id: "login",
      target_name: "로그인",
      source_component: "login_form",
    });
  }, []);

  const trackSignupSubmit = useCallback(() => {
    logger.log("click_interaction", {
      interaction_type: "button_signup_submit",
      target_id: "signup",
      target_name: "가입하기",
      source_component: "signup_form",
    });
  }, []);

  const trackLogout = useCallback(() => {
    logger.log("click_interaction", {
      interaction_type: "button_logout",
      target_id: "logout",
      target_name: "로그아웃",
      source_component: "profile_menu",
    });
  }, []);

  const trackProfileEditClick = useCallback(() => {
    logger.log("click_interaction", {
      interaction_type: "button_profile_edit",
      target_id: "profile_edit",
      target_name: "프로필 편집",
      source_component: "profile_menu",
    });
  }, []);

  const trackOrderHistoryClick = useCallback(() => {
    logger.log("click_interaction", {
      interaction_type: "button_order_history",
      target_id: "order_history",
      target_name: "주문 내역",
      source_component: "profile_menu",
    });
  }, []);

  // === 로그인/회원가입 실패 이벤트 (즉시 전송) ===
  const trackLoginFailure = useCallback(
    (email: string, errorMessage: string) => {
      logger.log("click_interaction", {
        interaction_type: "login_failure",
        target_id: "login",
        target_name: "로그인 실패",
        source_component: "login_form",
        email: email,
        error_message: errorMessage,
      });
    },
    []
  );

  const trackSignupFailure = useCallback(
    (email: string, name: string, errorMessage: string) => {
      logger.log("click_interaction", {
        interaction_type: "signup_failure",
        target_id: "signup",
        target_name: "회원가입 실패",
        source_component: "signup_form",
        email: email,
        name: name,
        error_message: errorMessage,
      });
    },
    []
  );

  const trackSignupAttempt = useCallback((email: string, name: string) => {
    logger.log("click_interaction", {
      interaction_type: "signup_attempt",
      target_id: "signup",
      target_name: "회원가입 시도",
      source_component: "signup_form",
      email: email,
      name: name,
    });
  }, []);

  const trackSignupSuccess = useCallback((email: string, name: string) => {
    logger.log("click_interaction", {
      interaction_type: "signup_success",
      target_id: "signup",
      target_name: "회원가입 성공",
      source_component: "signup_form",
      email: email,
      name: name,
    });
  }, []);

  const trackLoginLinkClick = useCallback(() => {
    logger.log("click_interaction", {
      interaction_type: "login_link",
      target_id: "login_link",
      target_name: "로그인 링크",
      source_component: "signup_form",
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
