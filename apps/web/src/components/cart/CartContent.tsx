import { CartItem, CartSummary } from "@/components/cart";
import PaymentMethodSelector from "@/components/payment/PaymentMethodSelector";
import { CartItemUI } from "@/types/cart";

interface CartContentProps {
  cartItems: CartItemUI[];
  total: number;
  isActionLoading: boolean;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartContent({
  cartItems,
  total,
  isActionLoading,
  onQuantityChange,
  onRemove,
}: CartContentProps) {
  return (
    <div className="flex-1 py-6">
      {/* Order Summary */}
      <CartSummary total={total} />

      {/* Cart Items */}
      <div className="space-y-4 pb-15">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
              disabled={isActionLoading}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">장바구니가 비어있습니다.</p>
          </div>
        )}

        {/* Payment Method Selector */}
        {cartItems.length > 0 && (
          <PaymentMethodSelector disabled={isActionLoading} />
        )}
      </div>
    </div>
  );
}
