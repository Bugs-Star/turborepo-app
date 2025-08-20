import { useEffect } from "react";
import { useHydrationStore } from "@/stores/hydrationStore";

export const useHydration = () => {
  const { isHydrated, setHydrated } = useHydrationStore();

  useEffect(() => {
    setHydrated(true);
  }, [setHydrated]);

  return isHydrated;
};

// 하이드레이션 상태를 기다리는 유틸리티 훅
export const useHydrationWait = () => {
  const isHydrated = useHydration();

  if (!isHydrated) {
    throw new Promise((resolve) => {
      const checkHydration = () => {
        if (useHydrationStore.getState().isHydrated) {
          resolve(true);
        } else {
          setTimeout(checkHydration, 10);
        }
      };
      checkHydration();
    });
  }

  return isHydrated;
};

// 하이드레이션 상태를 직접 접근하는 유틸리티
export const getHydrationState = () => useHydrationStore.getState().isHydrated;
export const setHydrationState = (hydrated: boolean) =>
  useHydrationStore.getState().setHydrated(hydrated);
