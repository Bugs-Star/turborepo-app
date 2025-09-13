import { useState } from "react";
import { Product } from "@/types";
import { ShoppingCart } from "lucide-react";
import { Button } from "@repo/ui/button";
import { useCart } from "@/hooks/useCart";
import { useCartFetch } from "@/hooks/useCartFetch";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { formatProductPrice } from "@/utils/productUtils";
import CartSuccessModal from "@/components/cart/CartSuccessModal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { addToCart, isLoading } = useCart({
    onSuccess,
    onError,
    onCartAddSuccess: () => setIsModalOpen(true), // 모달 표시
  });
  const { cartItems } = useCartFetch();
  const { isAuthenticated } = useAuthStore();
  const { showWarning } = useToast();
  const router = useRouter();

  const totalPrice = product.price * quantity;
  const isOutOfStock = product.currentStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    // 비로그인 상태면 토스트 메시지와 함께 즉시 로그인 페이지로 이동
    if (!isAuthenticated) {
      showWarning("로그인이 필요한 서비스입니다.");
      router.push("/login");
      return;
    }

    // 현재 장바구니에서 해당 상품의 수량 확인
    const existingCartItem = cartItems.find(
      (item) => item.productCode === product.productCode
    );
    const currentCartQuantity = existingCartItem?.quantity || 0;
    const newTotalQuantity = currentCartQuantity + quantity;

    // 재고 초과 검증
    if (newTotalQuantity > product.currentStock) {
      showWarning(
        `재고가 부족합니다. (현재 재고: ${product.currentStock}개, 장바구니: ${currentCartQuantity}개)`
      );
      return;
    }

    // 로거 콜백 호출 (있는 경우)
    onCartAdd?.(product, quantity);

    // 기존 장바구니 추가 로직 (상품 정보 포함)
    addToCart(product._id, quantity, product);
  };

  // 재고가 없는 경우 Sold Out 버튼 표시
  if (isOutOfStock) {
    return (
      <div
        className="fixed bottom-10 left-1/2 transform -translate-x-1/2 w-full max-w-lg px-6 pb-10 pt-6 bg-white rounded-t-3xl"
        style={{ boxShadow: "0 -4px 6px -1px rgba(0, 0, 0, 0.1)" }}
      >
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

  // 재고가 있는 경우 하단 고정 장바구니 추가 버튼 표시
  return (
    <>
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 w-full max-w-lg px-6 pb-10 pt-4 bg-white">
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

      {/* 장바구니 추가 성공 모달 */}
      <CartSuccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        // onContinueShopping과 onGoToCart를 제거하여 기본 동작 사용
      />
    </>
  );
}
