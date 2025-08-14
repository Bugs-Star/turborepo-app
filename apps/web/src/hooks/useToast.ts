import { useState, useCallback } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastState {
  isVisible: boolean;
  message: string;
  type: ToastType;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    message: "",
    type: "info",
  });

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    setToast({
      isVisible: true,
      message,
      type,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const showSuccess = useCallback(
    (message: string) => showToast(message, "success"),
    [showToast]
  );
  const showError = useCallback(
    (message: string) => showToast(message, "error"),
    [showToast]
  );
  const showWarning = useCallback(
    (message: string) => showToast(message, "warning"),
    [showToast]
  );
  const showInfo = useCallback(
    (message: string) => showToast(message, "info"),
    [showToast]
  );

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
