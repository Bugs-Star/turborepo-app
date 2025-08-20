import { orderService } from "@/lib/services";
import { useToast } from "./useToast";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { usePaymentStore } from "@/stores/paymentStore";
import { PaymentMethod, PAYMENT_METHODS } from "@/types/payment";

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

  const handlePaymentClick = async () => {
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
    } catch (error: any) {
      console.error("결제 처리 오류:", error);
      console.error("에러 상세 정보:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        config: error.config,
      });

      // 백엔드 에러 응답의 전체 내용 출력
      if (error.response?.data) {
        console.error(
          "백엔드 에러 응답:",
          JSON.stringify(error.response.data, null, 2)
        );
      }

      // 백엔드에서 반환하는 에러 메시지 처리
      const errorMessage =
        error.response?.data?.message || "결제 처리 중 오류가 발생했습니다.";
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
