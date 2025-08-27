import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { PaymentMethod } from "@/types/payment";

interface PaymentState {
  // 상태
  selectedMethod: PaymentMethod["value"];
  isProcessing: boolean;
  lastOrderId?: string;
  lastUsedMethod?: PaymentMethod["value"];
  error: string | null;

  // 액션
  setSelectedMethod: (method: PaymentMethod["value"]) => void;
  setProcessing: (processing: boolean) => void;
  setLastOrderId: (orderId: string) => void;
  setLastUsedMethod: (method: PaymentMethod["value"]) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const initialState = {
  selectedMethod: "card" as PaymentMethod["value"],
  isProcessing: false,
  lastOrderId: undefined,
  lastUsedMethod: undefined,
  error: null,
};

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set) => ({
      ...initialState,

      setSelectedMethod: (method) => {
        set({ selectedMethod: method });
      },

      setProcessing: (processing) => set({ isProcessing: processing }),

      setLastOrderId: (orderId) => set({ lastOrderId: orderId }),

      setLastUsedMethod: (method) => set({ lastUsedMethod: method }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "payment-storage",
      storage: createJSONStorage(() => localStorage),
      // 민감하지 않은 정보만 저장
      partialize: (state) => ({
        selectedMethod: state.selectedMethod,
        lastUsedMethod: state.lastUsedMethod,
        lastOrderId: state.lastOrderId,
      }),
    }
  )
);
