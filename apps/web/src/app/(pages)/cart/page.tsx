"use client";

import { BottomNavigation } from "@/components/layout";
import { PageHeader } from "@/components/ui";
import { CartContent, CartActionButton } from "@/components/cart";
import { AsyncWrapper } from "@/components/ui";
import {
  useCartFetch,
  useCartActions,
  usePayment,
  useNavigation,
} from "@/hooks";

export default function CartPage() {
  const { data: cartData, isLoading, error, isFetching } = useCartFetch();
  const { handleQuantityChange, handleRemove, isActionLoading } =
    useCartActions();
  const {
    isProcessing,
    selectedPaymentMethod,
    handlePaymentMethodChange,
    handlePaymentClick,
  } = usePayment();
  const { goToMenu } = useNavigation();

  const cartItems = cartData?.cart || [];
  const total = cartData?.summary?.totalAmount || 0;

  return (
    <AsyncWrapper
      loading={isLoading || isFetching}
      error={error?.message || null}
      loadingMessage="장바구니를 불러오는 중..."
      errorMessage="장바구니를 불러오는데 실패했습니다."
    >
      <div className="min-h-screen bg-white flex flex-col pb-20">
        <PageHeader title="장바구니" />

        {/* Main Content */}
        <CartContent
          cartItems={cartItems}
          total={total}
          isActionLoading={isActionLoading}
          onQuantityChange={handleQuantityChange}
          onRemove={handleRemove}
          selectedPaymentMethod={selectedPaymentMethod}
          onPaymentMethodChange={handlePaymentMethodChange}
        />

        {/* Action Buttons */}
        <CartActionButton
          hasItems={cartItems.length > 0}
          isProcessing={isProcessing}
          isActionLoading={isActionLoading}
          onPaymentClick={handlePaymentClick}
          onGoToMenu={goToMenu}
        />

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </AsyncWrapper>
  );
}
