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

    logger.log("viewScreen", {
      screenName: screenName,
      previousScreenName: previousScreen,
    } as any);
  }, []);

  // === 화면 체류 시간 이벤트 ===
  const trackScreenDuration = useCallback(
    (
      screenName: string,
      durationSeconds: number,
      startTime: string,
      endTime: string
    ) => {
      logger.log("viewScreenDuration", {
        screenName: screenName,
        durationSeconds: durationSeconds,
        startTime: startTime,
        endTime: endTime,
      });
    },
    []
  );

  // === 상품 관련 이벤트 ===
  const trackProductClick = useCallback(
    (product: Product, sourceComponent?: string) => {
      logger.log("clickInteraction", {
        interactionType: "productCard",
        targetId: product._id,
        sourceComponent: sourceComponent,
        productCode: product.productCode,
        price: product.price,
        category: product.category,
      });
    },
    []
  );

  const trackRecommendedProductClick = useCallback((product: Product) => {
    logger.log("clickInteraction", {
      interactionType: "productCard",
      targetId: product._id,
      sourceComponent: "home_recommended_section",
      productCode: product.productCode,
      price: product.price,
      category: product.category,
    });
  }, []);

  // === 카테고리 및 필터 이벤트 ===
  const trackCategoryClick = useCallback((category: string) => {
    logger.log("clickInteraction", {
      interactionType: "categoryLink",
      targetId: category,
      sourceComponent: "category_filter",
      categoryName: category,
    });
  }, []);

  const trackSortOptionSelect = useCallback((sortOption: string) => {
    logger.log("clickInteraction", {
      interactionType: "sortOptionSelect",
      targetId: sortOption,
      sourceComponent: "sort_filter",
      sortOption: sortOption,
    });
  }, []);

  // === 검색 이벤트 ===
  const trackSearchSubmit = useCallback(
    (searchKeyword: string, resultCount: number) => {
      logger.log("clickInteraction", {
        interactionType: "searchSubmit",
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
    logger.log("clickInteraction", {
      interactionType: "buttonAddToCart",
      targetId: product._id,
      sourceComponent: "product_detail",
      productCode: product.productCode,
      quantity: quantity,
      price: product.price,
    });
  }, []);

  const trackRemoveItem = useCallback((item: CartItemUI) => {
    logger.log("clickInteraction", {
      interactionType: "buttonRemoveItem",
      targetId: item.id,
      sourceComponent: "cart_item",
      productCode: item.productCode,
    });
  }, []);

  const trackCreateOrder = useCallback(
    (totalAmount: number, itemCount: number, cartItems: CartItemUI[]) => {
      logger.log("clickInteraction", {
        interactionType: "buttonCreateOrder",
        targetId: "order",
        sourceComponent: "cart_page",
        totalAmount: totalAmount,
        itemCount: itemCount,
        // 🆕 상품 정보 (수량 × 가격으로 계산)
        products: cartItems.map((item) => ({
          productCode: item.productCode,
          quantity: item.quantity,
          price: item.price * item.quantity, // 🆕 수량 × 가격
          unitPrice: item.price, // 🆕 개별 가격도 추가
        })),
      });
    },
    []
  );

  // === 프로모션/이벤트 관련 이벤트 ===
  const trackPromotionClick = useCallback((promotion: Promotion) => {
    logger.log("clickInteraction", {
      interactionType: "promotionCard",
      targetId: promotion._id,
      sourceComponent: "promotion_section",
      promotionName: promotion.title,
    });
  }, []);

  const trackEventClick = useCallback((event: Event) => {
    logger.log("clickInteraction", {
      interactionType: "eventCard",
      targetId: event._id,
      sourceComponent: "event_section",
      eventName: event.title,
    });
  }, []);

  const trackEventParticipate = useCallback((eventId: string) => {
    logger.log("clickInteraction", {
      interactionType: "buttonEventParticipate",
      targetId: eventId,
      sourceComponent: "event_detail",
    });
  }, []);

  const trackCouponDownload = useCallback(
    (promotionId: string, couponCode: string) => {
      logger.log("clickInteraction", {
        interactionType: "buttonCouponDownload",
        targetId: promotionId,
        sourceComponent: "promotion_detail",
        couponCode: couponCode,
      });
    },
    []
  );

  // === 광고 배너 이벤트 ===
  const trackAdBannerClick = useCallback((adId: string, campaignId: string) => {
    logger.log("clickInteraction", {
      interactionType: "adBanner",
      targetId: adId,
      sourceComponent: "ad_section",
      adId: adId,
      campaignId: campaignId,
    });
  }, []);

  // === 네비게이션 이벤트 ===
  const trackNavLinkClick = useCallback(
    (linkText: string, targetUrl: string) => {
      logger.log("clickInteraction", {
        interactionType: "navLink",
        sourceComponent: "navigation",
        linkText: linkText,
        targetUrl: targetUrl,
      });
    },
    []
  );

  // === 기타 상호작용 이벤트 ===
  const trackViewMore = useCallback((pageNumber: number) => {
    logger.log("clickInteraction", {
      interactionType: "buttonViewMore",
      targetId: `page_${pageNumber}`,
      sourceComponent: "product_list",
      pageNumber: pageNumber,
    });
  }, []);

  const trackPopupClose = useCallback((popupId: string) => {
    logger.log("clickInteraction", {
      interactionType: "buttonPopupClose",
      targetId: popupId,
      sourceComponent: "popup",
      popupId: popupId,
    });
  }, []);

  // === 사용자 인증 이벤트 ===
  const trackLoginSubmit = useCallback(() => {
    logger.log("clickInteraction", {
      interactionType: "buttonLoginSubmit",
      targetId: "login",
      sourceComponent: "login_form",
    });
  }, []);

  const trackSignupSubmit = useCallback(() => {
    logger.log("clickInteraction", {
      interactionType: "buttonSignupSubmit",
      targetId: "signup",
      sourceComponent: "signup_form",
    });
  }, []);

  const trackLogout = useCallback(() => {
    logger.log("clickInteraction", {
      interactionType: "buttonLogout",
      targetId: "logout",
      sourceComponent: "profile_menu",
    });
  }, []);

  const trackProfileEditClick = useCallback(() => {
    logger.log("clickInteraction", {
      interactionType: "buttonProfileEdit",
      targetId: "profile_edit",
      sourceComponent: "profile_menu",
    });
  }, []);

  const trackOrderHistoryClick = useCallback(() => {
    logger.log("clickInteraction", {
      interactionType: "buttonOrderHistory",
      targetId: "order_history",
      sourceComponent: "profile_menu",
    });
  }, []);

  // === 로그인/회원가입 실패 이벤트 (즉시 전송) ===
  const trackLoginFailure = useCallback(
    (email: string, errorMessage: string) => {
      logger.log("clickInteraction", {
        interactionType: "loginFailure",
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
      logger.log("clickInteraction", {
        interactionType: "signupFailure",
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
    logger.log("clickInteraction", {
      interactionType: "signupAttempt",
      targetId: "signup",
      sourceComponent: "signup_form",
      email: email,
      name: name,
    });
  }, []);

  const trackSignupSuccess = useCallback((email: string, name: string) => {
    logger.log("clickInteraction", {
      interactionType: "signupSuccess",
      targetId: "signup",
      sourceComponent: "signup_form",
      email: email,
      name: name,
    });
  }, []);

  const trackLoginLinkClick = useCallback(() => {
    logger.log("clickInteraction", {
      interactionType: "loginLink",
      targetId: "login_link",
      sourceComponent: "signup_form",
    });
  }, []);

  return {
    trackScreenView,
    trackScreenDuration,
    trackProductClick,
    trackRecommendedProductClick,
    trackCategoryClick,
    trackSortOptionSelect,
    trackSearchSubmit,
    trackAddToCart,
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
