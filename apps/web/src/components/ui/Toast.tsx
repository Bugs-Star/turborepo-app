"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { useVisible } from "@/hooks";

interface ToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  onClose: () => void;
  id: string; // 고유 ID 추가
}

export const Toast = ({ message, type, onClose, id }: ToastProps) => {
  const { isVisible, show, hide } = useVisible(`toast-${id}`);

  const handleClose = useCallback(() => {
    hide();
    setTimeout(onClose, 300);
  }, [hide, onClose]);

  useEffect(() => {
    show();
  }, [show]);

  const typeClasses = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-white",
    info: "bg-blue-500 text-white",
  };

  const iconClasses = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div
      className={`
        ${typeClasses[type]}
        px-4 py-3 rounded-lg shadow-lg flex items-center gap-2
        transform transition-all duration-300 ease-in-out
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      <span className="font-bold">{iconClasses[type]}</span>
      <span className="flex-1">{message}</span>
      <button
        onClick={handleClose}
        className="ml-2 hover:opacity-70 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  );
};
