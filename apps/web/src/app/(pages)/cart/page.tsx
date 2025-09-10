"use client";

import { useEffect, useRef } from "react";
import { BottomNavigation } from "@/components/layout";
import { PageHeader, AuthGuard } from "@/components/ui";
import { CartContent, CartActionButton } from "@/components/cart";
import { AsyncWrapper } from "@/components/ui";
import {
  useCartFetch,
  useCartActions,
  usePayment,
  useNavigation,
  useAnalytics,
  useCartAnalyticsActions,
} from "@/hooks";

export default function CartPage() {
  const { cartItems, summary, isLoading, error, isFetching } = useCartFetch();
  const { handleQuantityChange, handleRemove, isActionLoading } =
    useCartActions();
  const { isProcessing, handlePaymentClick } = usePayment();
  const { goToMenu } = useNavigation();

  // 로거 훅들
  const { trackScreenView } = useAnalytics();
  const { handleCartView, handleCartRemove, handleOrderInitiate } =
    useCartAnalyticsActions();

  // 중복 로깅 방지를 위한 ref
  const hasLoggedScreenView = useRef(false);
  const hasLoggedCartView = useRef(false);

  const total = summary?.totalAmount || 0;

  // 페이지 로드 시 화면 조회 로그 (브라우저에서만 실행, 한 번만)
  useEffect(() => {
    if (typeof window !== "undefined" && !hasLoggedScreenView.current) {
      trackScreenView("/cart");
      hasLoggedScreenView.current = true;
    }
  }, [trackScreenView]);

  // 장바구니 데이터가 로드되면 장바구니 뷰 로그 (한 번만)
  useEffect(() => {
    if (cartItems && summary && !hasLoggedCartView.current) {
      handleCartView();
      hasLoggedCartView.current = true;
    }
  }, [cartItems, summary, handleCartView, isLoading, isFetching, error]);

  // 장바구니 제거 로깅 핸들러
  const handleRemoveWithLogging = (id: string) => {
    const item = cartItems.find((item) => item.id === id);
    if (item) {
      handleCartRemove(item);
    }
    handleRemove(id);
  };

  // 주문 시작 로깅 핸들러
  const handlePaymentClickWithLogging = () => {
    handleOrderInitiate(total, summary?.totalItems || 0, cartItems);
    handlePaymentClick();
  };

  return (
    <AuthGuard backgroundColor="bg-white" title="장바구니" showHeader={true}>
      <div className="min-h-screen bg-white flex flex-col pb-20">
        <PageHeader title="장바구니" />

        {/* Main Content - 고정 헤더 아래 여백 추가 */}
        <div className="pt-14 px-6">
          <AsyncWrapper
            loading={isLoading || isFetching}
            error={error?.message || null}
            loadingMessage="장바구니를 불러오는 중..."
            errorMessage="장바구니를 불러오는데 실패했습니다."
          >
            <CartContent
              cartItems={cartItems}
              total={total}
              isActionLoading={isActionLoading}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemoveWithLogging}
            />

            {/* Action Buttons */}
            <CartActionButton
              hasItems={cartItems.length > 0}
              isProcessing={isProcessing}
              isActionLoading={isActionLoading}
              onPaymentClick={handlePaymentClickWithLogging}
              onGoToMenu={goToMenu}
            />
          </AsyncWrapper>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </AuthGuard>
  );
}
