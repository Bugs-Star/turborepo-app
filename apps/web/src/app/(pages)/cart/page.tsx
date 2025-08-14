"use client";

import { useState, useMemo } from "react";
import { BottomNavigation } from "@/components/layout";
import { PageHeader } from "@/components/ui";
import { CartItem } from "@/components/cart";
import { Button } from "@repo/ui";
import {
  dummyCartItems,
  CartItem as CartItemType,
} from "@/constants/dummyData";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemType[]>(dummyCartItems);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const total = subtotal; // 할인이나 배송비가 없으므로 소계와 총계가 동일

  const handleQuantityChange = (id: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemove = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePayment = () => {
    // 결제 로직 구현 예정
    alert("결제 기능은 준비 중입니다.");
  };

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
              {subtotal.toLocaleString()}원
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
        <div className="space-y-4">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
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
          <Button onClick={handlePayment} variant="green" size="lg" fullWidth>
            결제하기
          </Button>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
