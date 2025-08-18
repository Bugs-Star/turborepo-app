"use client";

import { BottomNavigation } from "@/components/layout";
import { PageHeader } from "@/components/ui";
import { CartItem } from "@/components/cart";
import { PaymentModal } from "@/components/payment";
import { AsyncWrapper } from "@/components/ui";
import { Button } from "@repo/ui";
import { useCartFetch, useCart, usePayment } from "@/hooks";
import { useState } from "react";

export default function CartPage() {
  const { data: cartData, isLoading, error, isFetching } = useCartFetch();
  const {
    removeFromCart,
    updateCartItemQuantity,
    isLoading: isActionLoading,
  } = useCart();
  const { processPayment, isProcessing } = usePayment();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "card" | "cash" | "point"
  >("card");

  const cartItems = cartData?.cart || [];
  const total = cartData?.summary?.totalAmount || 0;

  const handleQuantityChange = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await handleRemove(id);
    } else {
      await updateCartItemQuantity(id, quantity);
    }
  };

  const handleRemove = async (id: string) => {
    await removeFromCart(id);
  };

  const handlePaymentClick = () => {
    console.log("결제 버튼 클릭");
    console.log("장바구니 아이템:", cartItems);
    console.log("총 금액:", total);

    if (cartItems.length === 0) {
      alert("장바구니가 비어있습니다.");
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async () => {
    await processPayment(selectedPaymentMethod);
    setShowPaymentModal(false);
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
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
        <div className="flex-1 px-4 py-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 ">소계:</span>
              <span className="text-gray-900 font-medium">
                {total.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-semibold text-lg">총계:</span>
              <span className="text-green-700 font-semibold text-lg">
                {total.toLocaleString()}원
              </span>
            </div>
          </div>

          {/* Cart Items */}
          <div className="space-y-4 pb-15">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <CartItem
                  key={item._id}
                  item={{
                    id: item._id,
                    name: item.product.productName,
                    price: item.product.price,
                    quantity: item.quantity,
                    imageUrl: item.product.productImg,
                  }}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                  disabled={isActionLoading}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">장바구니가 비어있습니다.</p>
              </div>
            )}
          </div>
        </div>

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

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          isProcessing={isProcessing}
          selectedPaymentMethod={selectedPaymentMethod}
          onPaymentMethodChange={setSelectedPaymentMethod}
          onConfirm={handlePaymentConfirm}
          onCancel={handlePaymentCancel}
        />

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </AsyncWrapper>
  );
}
