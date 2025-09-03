import { Button } from "@repo/ui";

interface CartActionButtonProps {
  hasItems: boolean;
  isProcessing: boolean;
  isActionLoading: boolean;
  onPaymentClick: () => void;
  onGoToMenu: () => void;
}

export default function CartActionButton({
  hasItems,
  isProcessing,
  isActionLoading,
  onPaymentClick,
  onGoToMenu,
}: CartActionButtonProps) {
  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-md px-6 pb-4">
      {hasItems ? (
        <Button
          onClick={onPaymentClick}
          variant="green"
          size="lg"
          fullWidth
          disabled={isActionLoading || isProcessing}
        >
          {isProcessing ? "결제 처리 중..." : "결제하기"}
        </Button>
      ) : (
        <Button onClick={onGoToMenu} variant="green" size="lg" fullWidth>
          메뉴 담으러 가기
        </Button>
      )}
    </div>
  );
}
