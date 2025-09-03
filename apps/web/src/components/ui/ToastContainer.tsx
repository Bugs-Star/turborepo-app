"use client";

import { useToastStore } from "@/stores/toastStore";
import { Toast } from "./Toast";

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-full max-w-lg z-50 space-y-2 px-4">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};
