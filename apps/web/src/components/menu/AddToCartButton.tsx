import { Product } from "@/lib/services";
import { ShoppingCart } from "lucide-react";
import { Button } from "@repo/ui/button";
import { useCart } from "@/hooks/useCart";

// 가격 포맷팅 함수
const formatPrice = (price: number) => {
  return price.toLocaleString() + "원";
};

interface AddToCartButtonProps {
  product: Product;
  quantity: number;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function AddToCartButton({
  product,
  quantity,
  disabled = false,
  onSuccess,
  onError,
}: AddToCartButtonProps) {
  const { addToCart, isLoading } = useCart({
    onSuccess,
    onError,
  });

  const totalPrice = product.price * quantity;

  const handleAddToCart = () => {
    addToCart(product._id, quantity);
  };

  return (
    <div className="px-6 pb-6">
      <Button
        onClick={handleAddToCart}
        disabled={disabled || isLoading}
        variant="green"
        size="lg"
        fullWidth
        style={{
          justifyContent: "space-between",
        }}
      >
        <div className="flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2" />
          <span>{isLoading ? "추가 중..." : "장바구니에 추가"}</span>
        </div>
        <span>{formatPrice(totalPrice)}</span>
      </Button>
    </div>
  );
}
