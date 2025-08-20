import { create } from "zustand";

interface HydrationState {
  isHydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
}

export const useHydrationStore = create<HydrationState>((set) => ({
  isHydrated: false,
  setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),
}));
