import { useCallback, useRef } from "react";
import { useToast } from "@/hooks";

export const useErrorHandler = () => {
  const { showToast } = useToast();
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  const handleError = useCallback(
    (error: any, fallbackMessage: string) => {
      const message = error.response?.data?.message || fallbackMessage;
      showToastRef.current(message, "error");
    },
    [] // Empty dependency array for stability
  );

  return { handleError };
};
