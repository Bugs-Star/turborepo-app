import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  createdAt: number;
}

interface ToastState {
  // 상태
  toasts: ToastItem[];

  // 액션
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // 편의 함수들
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const generateToastId = () =>
  `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useToastStore = create<ToastState>((set, get) => ({
  // 초기 상태
  toasts: [],

  // 토스트 추가
  addToast: (message: string, type: ToastType, duration = 3000) => {
    const id = generateToastId();
    const toast: ToastItem = {
      id,
      message,
      type,
      duration,
      createdAt: Date.now(),
    };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // 자동 제거
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },

  // 토스트 제거
  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  // 모든 토스트 제거
  clearToasts: () => {
    set({ toasts: [] });
  },

  // 편의 함수들
  showSuccess: (message: string, duration?: number) => {
    get().addToast(message, "success", duration);
  },

  showError: (message: string, duration?: number) => {
    get().addToast(message, "error", duration);
  },

  showWarning: (message: string, duration?: number) => {
    get().addToast(message, "warning", duration);
  },

  showInfo: (message: string, duration?: number) => {
    get().addToast(message, "info", duration);
  },
}));
