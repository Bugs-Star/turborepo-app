import { useCallback } from "react";
import { useUIStore } from "@/stores/uiStore";

// 확장/축소 상태를 사용하는 훅
export const useExpanded = (key: string) => {
  const isExpanded = useUIStore((state) => state.expandedStates[key] || false);
  const setExpanded = useUIStore((state) => state.setExpanded);
  const toggleExpanded = useUIStore((state) => state.toggleExpanded);
  const clearExpanded = useUIStore((state) => state.clearExpanded);

  const expand = useCallback(() => {
    setExpanded(key, true);
  }, [key, setExpanded]);

  const collapse = useCallback(() => {
    setExpanded(key, false);
  }, [key, setExpanded]);

  const toggle = useCallback(() => {
    toggleExpanded(key);
  }, [key, toggleExpanded]);

  const clear = useCallback(() => {
    clearExpanded(key);
  }, [key, clearExpanded]);

  return {
    isExpanded,
    expand,
    collapse,
    toggle,
    clear,
  };
};

// 호버 상태를 사용하는 훅
export const useHovered = (key: string) => {
  const isHovered = useUIStore((state) => state.hoverStates[key] || false);
  const setHovered = useUIStore((state) => state.setHovered);
  const clearHovered = useUIStore((state) => state.clearHovered);

  const startHover = useCallback(() => {
    setHovered(key, true);
  }, [key, setHovered]);

  const stopHover = useCallback(() => {
    setHovered(key, false);
  }, [key, setHovered]);

  const clear = useCallback(() => {
    clearHovered(key);
  }, [key, clearHovered]);

  return {
    isHovered,
    startHover,
    stopHover,
    clear,
  };
};

// 포커스 상태를 사용하는 훅
export const useFocused = (key: string) => {
  const isFocused = useUIStore((state) => state.focusStates[key] || false);
  const setFocused = useUIStore((state) => state.setFocused);
  const clearFocused = useUIStore((state) => state.clearFocused);

  const focus = useCallback(() => {
    setFocused(key, true);
  }, [key, setFocused]);

  const blur = useCallback(() => {
    setFocused(key, false);
  }, [key, setFocused]);

  const clear = useCallback(() => {
    clearFocused(key);
  }, [key, clearFocused]);

  return {
    isFocused,
    focus,
    blur,
    clear,
  };
};

// 표시/숨김 상태를 사용하는 훅 (모달, 팝업, 토스트 등)
export const useVisible = (key: string) => {
  const isVisible = useUIStore((state) => state.visibilityStates[key] || false);
  const setVisible = useUIStore((state) => state.setVisible);
  const toggleVisible = useUIStore((state) => state.toggleVisible);
  const clearVisible = useUIStore((state) => state.clearVisible);

  const show = useCallback(() => {
    setVisible(key, true);
  }, [key, setVisible]);

  const hide = useCallback(() => {
    setVisible(key, false);
  }, [key, setVisible]);

  const toggle = useCallback(() => {
    toggleVisible(key);
  }, [key, toggleVisible]);

  const clear = useCallback(() => {
    clearVisible(key);
  }, [key, clearVisible]);

  return {
    isVisible,
    show,
    hide,
    toggle,
    clear,
  };
};

// 모든 UI 상태를 클리어하는 훅
export const useUIClear = () => {
  const clearAllUI = useUIStore((state) => state.clearAllUI);

  return {
    clearAllUI,
  };
};
