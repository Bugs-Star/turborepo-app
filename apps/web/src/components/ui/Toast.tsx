"use client";

import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
  const [isShowing, setIsShowing] = useState(false);

  const handleClose = useCallback(() => {
    setIsShowing(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    setIsShowing(true);
  }, []);

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
        ${isShowing ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
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
