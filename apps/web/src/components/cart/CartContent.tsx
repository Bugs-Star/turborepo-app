import { CartItem, CartSummary } from "@/components/cart";

interface CartContentProps {
  cartItems: any[];
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
    <div className="flex-1 px-4 py-6">
      {/* Order Summary */}
      <CartSummary total={total} />

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
      </div>
    </div>
  );
}
