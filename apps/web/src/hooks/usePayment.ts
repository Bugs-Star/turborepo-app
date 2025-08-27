import { orderService } from "@/lib/services";
import { useToast } from "./useToast";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { usePaymentStore } from "@/stores/paymentStore";
import { PaymentMethod, PAYMENT_METHODS } from "@/types/payment";
import { handleError, getUserFriendlyMessage } from "@/lib/errorHandler";

export type { PaymentMethod };
export { PAYMENT_METHODS };

export const usePayment = () => {
  const { showToast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Zustand 스토어에서 상태 가져오기
  const {
    selectedMethod,
    isProcessing,
    error,
    setProcessing,
    setError,
    clearError,
    setLastUsedMethod,
  } = usePaymentStore();

  const handlePaymentClick = async (onOrderInitiate?: () => void) => {
    // 로거 콜백 호출 (있는 경우)
    onOrderInitiate?.();

    await processPayment(selectedMethod);
  };

  const processPayment = async (paymentMethod?: PaymentMethod["value"]) => {
    const method = paymentMethod || selectedMethod;
    setProcessing(true);
    clearError();

    try {
      console.log("결제 요청 데이터:", { paymentMethod: method });

      // 토큰 상태 확인
      const accessToken = localStorage.getItem("accessToken");
      console.log("액세스 토큰 존재:", !!accessToken);

      const response = await orderService.createOrder({
        paymentMethod: method,
      });

      console.log("결제 응답:", response);

      if (response.success) {
        // 최근 사용한 결제 수단으로 설정
        setLastUsedMethod(method);

        showToast("주문이 완료되었습니다!", "success");
        // 장바구니 쿼리 무효화하여 즉시 업데이트
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["cartCount"] });
        // 즉시 주문 내역 페이지로 이동
        router.push("/order-history");
      } else {
        setError("주문 처리 중 오류가 발생했습니다.");
        showToast("주문 처리 중 오류가 발생했습니다.", "error");
      }
    } catch (error: unknown) {
      // 통합 에러 핸들러로 에러 처리
      handleError(error as Error, "PAYMENT_PROCESS");

      // 사용자에게 친화적인 메시지 표시
      const errorMessage = getUserFriendlyMessage(error);
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setProcessing(false);
    }
  };

  return {
    processPayment,
    isProcessing,
    selectedPaymentMethod: selectedMethod, // 호환성을 위해 유지
    error,
    handlePaymentClick,
  };
};
