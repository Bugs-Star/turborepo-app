import { create } from "zustand";

interface LoadingState {
  // 개별 로딩 상태들
  loadingStates: Record<string, boolean>;

  // 액션들
  setLoading: (key: string, loading: boolean) => void;
  clearLoading: (key: string) => void;
  clearAllLoading: () => void;

  // 유틸리티 함수들
  isLoading: (key: string) => boolean;
}

export const useLoadingStore = create<LoadingState>((set, get) => ({
  loadingStates: {},

  setLoading: (key: string, loading: boolean) => {
    set((state) => ({
      loadingStates: {
        ...state.loadingStates,
        [key]: loading,
      },
    }));
  },

  clearLoading: (key: string) => {
    set((state) => {
      const newLoadingStates = { ...state.loadingStates };
      delete newLoadingStates[key];
      return { loadingStates: newLoadingStates };
    });
  },

  clearAllLoading: () => {
    set({ loadingStates: {} });
  },

  isLoading: (key: string) => {
    return get().loadingStates[key] || false;
  },
}));
