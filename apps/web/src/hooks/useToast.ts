import { useToastStore } from "@/stores/toastStore";

export const useToast = () => {
  const { showSuccess, showError, showWarning, showInfo, addToast } =
    useToastStore();

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info",
    duration?: number
  ) => {
    addToast(message, type, duration);
  };

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
