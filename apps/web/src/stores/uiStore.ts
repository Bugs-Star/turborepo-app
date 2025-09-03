import { create } from "zustand";

interface UIState {
  // 확장/축소 상태들
  expandedStates: Record<string, boolean>;

  // 호버 상태들
  hoverStates: Record<string, boolean>;

  // 포커스 상태들
  focusStates: Record<string, boolean>;

  // 표시/숨김 상태들 (모달, 팝업, 토스트 등)
  visibilityStates: Record<string, boolean>;

  // 액션들
  setExpanded: (key: string, expanded: boolean) => void;
  setHovered: (key: string, hovered: boolean) => void;
  setFocused: (key: string, focused: boolean) => void;
  setVisible: (key: string, visible: boolean) => void;

  // 토글 액션들
  toggleExpanded: (key: string) => void;
  toggleVisible: (key: string) => void;

  // 클리어 액션들
  clearExpanded: (key: string) => void;
  clearHovered: (key: string) => void;
  clearFocused: (key: string) => void;
  clearVisible: (key: string) => void;
  clearAllUI: () => void;

  // 유틸리티 함수들
  isExpanded: (key: string) => boolean;
  isHovered: (key: string) => boolean;
  isFocused: (key: string) => boolean;
  isVisible: (key: string) => boolean;
}

export const useUIStore = create<UIState>((set, get) => ({
  expandedStates: {},
  hoverStates: {},
  focusStates: {},
  visibilityStates: {},

  setExpanded: (key: string, expanded: boolean) => {
    set((state) => ({
      expandedStates: {
        ...state.expandedStates,
        [key]: expanded,
      },
    }));
  },

  setHovered: (key: string, hovered: boolean) => {
    set((state) => ({
      hoverStates: {
        ...state.hoverStates,
        [key]: hovered,
      },
    }));
  },

  setFocused: (key: string, focused: boolean) => {
    set((state) => ({
      focusStates: {
        ...state.focusStates,
        [key]: focused,
      },
    }));
  },

  setVisible: (key: string, visible: boolean) => {
    set((state) => ({
      visibilityStates: {
        ...state.visibilityStates,
        [key]: visible,
      },
    }));
  },

  toggleExpanded: (key: string) => {
    const current = get().expandedStates[key] || false;
    set((state) => ({
      expandedStates: {
        ...state.expandedStates,
        [key]: !current,
      },
    }));
  },

  toggleVisible: (key: string) => {
    const current = get().visibilityStates[key] || false;
    set((state) => ({
      visibilityStates: {
        ...state.visibilityStates,
        [key]: !current,
      },
    }));
  },

  clearExpanded: (key: string) => {
    set((state) => {
      const newExpandedStates = { ...state.expandedStates };
      delete newExpandedStates[key];
      return { expandedStates: newExpandedStates };
    });
  },

  clearHovered: (key: string) => {
    set((state) => {
      const newHoverStates = { ...state.hoverStates };
      delete newHoverStates[key];
      return { hoverStates: newHoverStates };
    });
  },

  clearFocused: (key: string) => {
    set((state) => {
      const newFocusStates = { ...state.focusStates };
      delete newFocusStates[key];
      return { focusStates: newFocusStates };
    });
  },

  clearVisible: (key: string) => {
    set((state) => {
      const newVisibilityStates = { ...state.visibilityStates };
      delete newVisibilityStates[key];
      return { visibilityStates: newVisibilityStates };
    });
  },

  clearAllUI: () => {
    set({
      expandedStates: {},
      hoverStates: {},
      focusStates: {},
      visibilityStates: {},
    });
  },

  isExpanded: (key: string) => {
    return get().expandedStates[key] || false;
  },

  isHovered: (key: string) => {
    return get().hoverStates[key] || false;
  },

  isFocused: (key: string) => {
    return get().focusStates[key] || false;
  },

  isVisible: (key: string) => {
    return get().visibilityStates[key] || false;
  },
}));
