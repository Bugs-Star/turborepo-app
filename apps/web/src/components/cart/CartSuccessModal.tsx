"use client";

import { useRouter } from "next/navigation";
import { Button } from "@repo/ui";
import { Modal } from "@/components/ui/UIComponents";
import { useVisible, useProductNavigation } from "@/hooks";

interface CartSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueShopping?: () => void;
  onGoToCart?: () => void;
}

export default function CartSuccessModal({
  isOpen,
  onClose,
  onContinueShopping,
  onGoToCart,
}: CartSuccessModalProps) {
  const router = useRouter();
  const { hide } = useVisible("cart-success-modal");
  const { navigateBack } = useProductNavigation();

  const handleContinueShopping = () => {
    hide();
    if (onContinueShopping) {
      onContinueShopping();
    } else {
      navigateBack();
    }
  };

  const handleGoToCart = () => {
    hide();
    if (onGoToCart) {
      onGoToCart();
    } else {
      // 기본 동작: 장바구니 페이지로 이동
      router.push("/cart");
    }
  };

  const handleClose = () => {
    hide();
    onClose();
  };

  return (
    <Modal
      modalKey="cart-success-modal"
      isOpen={isOpen}
      onClose={handleClose}
      className="flex items-center justify-center p-4"
      overlayClassName="bg-black/50"
      contentClassName="w-full max-w-sm"
    >
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        {/* 모달 내용 */}
        <div className="text-center">
          {/* 성공 아이콘 */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* 메시지 */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            장바구니에 상품이 추가되었습니다!
          </h3>

          {/* 버튼들 */}
          <div className="space-y-3 mt-6">
            <Button
              onClick={handleContinueShopping}
              variant="white"
              size="md"
              fullWidth
              className="rounded-lg"
            >
              계속 쇼핑하기
            </Button>

            <Button
              onClick={handleGoToCart}
              variant="green"
              size="md"
              fullWidth
              className="rounded-lg"
            >
              장바구니로 이동
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
