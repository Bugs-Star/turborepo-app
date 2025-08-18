import { useState } from "react";
import { orderService } from "@/lib/services";
import { useToast } from "./useToast";
import { useRouter } from "next/navigation";

export interface PaymentMethod {
  value: "card" | "cash" | "point";
  label: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { value: "card", label: "카드" },
  { value: "cash", label: "현금" },
  { value: "point", label: "포인트" },
];

export const usePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const processPayment = async (
    paymentMethod: PaymentMethod["value"] = "card"
  ) => {
    setIsProcessing(true);

    try {
      console.log("결제 요청 데이터:", { paymentMethod });

      // 토큰 상태 확인
      const accessToken = localStorage.getItem("accessToken");
      console.log("액세스 토큰 존재:", !!accessToken);

      const response = await orderService.createOrder({
        paymentMethod,
      });

      console.log("결제 응답:", response);

      if (response.success) {
        showToast("주문이 완료되었습니다!", "success");
        // 주문 내역 페이지로 이동
        router.push("/order-history");
      } else {
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
      showToast(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPayment,
    isProcessing,
  };
};
