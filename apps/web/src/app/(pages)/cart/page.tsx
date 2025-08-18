"use client";

import { BottomNavigation } from "@/components/layout";
import { PageHeader } from "@/components/ui";
import { CartItem } from "@/components/cart";
import { Button } from "@repo/ui";
import { useCartFetch, useCart } from "@/hooks";

export default function CartPage() {
  const { data: cartData, isLoading, error } = useCartFetch();
  const {
    removeFromCart,
    updateCartItemQuantity,
    isLoading: isActionLoading,
  } = useCart();

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

  const handlePayment = () => {
    // 결제 로직 구현 예정
    alert("결제 기능은 준비 중입니다.");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col pb-20">
        <PageHeader title="장바구니" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">장바구니를 불러오는 중...</p>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col pb-20">
        <PageHeader title="장바구니" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500">장바구니를 불러오는데 실패했습니다.</p>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
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
            onClick={handlePayment}
            variant="green"
            size="lg"
            fullWidth
            disabled={isActionLoading}
          >
            결제하기
          </Button>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
