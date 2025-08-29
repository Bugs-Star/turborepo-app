import { Product } from "@/types";
import { ShoppingCart } from "lucide-react";
import { Button } from "@repo/ui/button";
import { useCart } from "@/hooks/useCart";
import { formatProductPrice } from "@/utils/productUtils";

interface AddToCartButtonProps {
  product: Product;
  quantity: number;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onCartAdd?: (product: Product, quantity: number) => void;
}

export default function AddToCartButton({
  product,
  quantity,
  disabled = false,
  onSuccess,
  onError,
  onCartAdd,
}: AddToCartButtonProps) {
  const { addToCart, isLoading } = useCart({
    onSuccess,
    onError,
  });

  const totalPrice = product.price * quantity;
  const isOutOfStock = product.currentStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    // 로거 콜백 호출 (있는 경우)
    onCartAdd?.(product, quantity);

    // 기존 장바구니 추가 로직 (상품 정보 포함)
    addToCart(product._id, quantity, product);
  };

  // 재고가 없는 경우 Sold Out 버튼 표시
  if (isOutOfStock) {
    return (
      <div className="pb-6">
        <Button
          variant="red"
          size="lg"
          fullWidth
          disabled={true}
          style={{
            justifyContent: "center",
            cursor: "not-allowed",
          }}
        >
          <span>SOLD OUT</span>
        </Button>
      </div>
    );
  }

  // 재고가 있는 경우 기존 장바구니 추가 버튼 표시
  return (
    <div className="pb-6">
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
        <span>{formatProductPrice(totalPrice)}</span>
      </Button>
    </div>
  );
}
