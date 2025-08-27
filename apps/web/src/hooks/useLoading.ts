import { useCallback } from "react";
import { useLoadingStore } from "@/stores/loadingStore";

// 특정 키의 로딩 상태를 사용하는 훅
export const useLoading = (key: string) => {
  const isLoading = useLoadingStore(
    (state) => state.loadingStates[key] || false
  );
  const setLoading = useLoadingStore((state) => state.setLoading);
  const clearLoading = useLoadingStore((state) => state.clearLoading);

  const startLoading = useCallback(() => {
    setLoading(key, true);
  }, [key, setLoading]);

  const stopLoading = useCallback(() => {
    setLoading(key, false);
  }, [key, setLoading]);

  const clearLoadingState = useCallback(() => {
    clearLoading(key);
  }, [key, clearLoading]);

  return {
    isLoading,
    startLoading,
    stopLoading,
    clearLoadingState,
  };
};

// 비동기 작업을 래핑하는 유틸리티 훅
export const useAsyncLoading = (key: string) => {
  const { isLoading, startLoading, stopLoading } = useLoading(key);

  const withLoading = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T> => {
      startLoading();
      try {
        const result = await asyncFn();
        return result;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  return {
    isLoading,
    withLoading,
  };
};

// 지연된 로딩 상태를 관리하는 훅
export const useDelayedLoading = (key: string, delay: number = 300) => {
  const { isLoading, startLoading, stopLoading } = useLoading(key);

  const startDelayedLoading = useCallback(() => {
    const timeoutId = setTimeout(() => {
      startLoading();
    }, delay);

    // cleanup 함수 반환
    return () => {
      clearTimeout(timeoutId);
    };
  }, [delay, startLoading]);

  const stopDelayedLoading = useCallback(() => {
    stopLoading();
  }, [stopLoading]);

  return {
    isLoading,
    startDelayedLoading,
    stopDelayedLoading,
  };
};
