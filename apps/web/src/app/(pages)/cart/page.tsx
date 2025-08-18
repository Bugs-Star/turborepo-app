"use client";

import { BottomNavigation } from "@/components/layout";
import { PageHeader } from "@/components/ui";
import { CartContent } from "@/components/cart";
import { AsyncWrapper } from "@/components/ui";
import { Button } from "@repo/ui";
import { useCartFetch, useCartActions, usePayment } from "@/hooks";
import { useState } from "react";

export default function CartPage() {
  const { data: cartData, isLoading, error, isFetching } = useCartFetch();
  const { handleQuantityChange, handleRemove, isActionLoading } =
    useCartActions();
  const { processPayment, isProcessing } = usePayment();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "card" | "cash" | "point"
  >("card");

  const cartItems = cartData?.cart || [];
  const total = cartData?.summary?.totalAmount || 0;

  const handlePaymentClick = async () => {
    await processPayment(selectedPaymentMethod);
  };

  const handlePaymentMethodChange = (method: "card" | "cash" | "point") => {
    setSelectedPaymentMethod(method);
  };

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

        {/* Payment Button */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-20 left-0 right-0 px-4 pb-4">
            <Button
              onClick={handlePaymentClick}
              variant="green"
              size="lg"
              fullWidth
              disabled={isActionLoading || isProcessing}
            >
              {isProcessing ? "결제 처리 중..." : "결제하기"}
            </Button>
          </div>
        )}

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </AsyncWrapper>
  );
}
