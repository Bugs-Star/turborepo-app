import { useCallback, useRef } from "react";
import { useToast } from "@/hooks";
import { handleError, getUserFriendlyMessage } from "@/lib/errorHandler";

export const useErrorHandler = () => {
  const { showToast } = useToast();
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  const handleError = useCallback((error: any, fallbackMessage: string) => {
    // 통합 에러 핸들러로 에러 처리
    handleError(error, "GENERAL_ERROR");

    // 사용자에게 친화적인 메시지 표시
    const message = getUserFriendlyMessage(error) || fallbackMessage;
    showToastRef.current(message, "error");
  }, []);

  return { handleError };
};
