import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, authService } from "@/lib";

// JWT 토큰 유틸리티 함수들
const tokenUtils = {
  // JWT 토큰에서 만료 시간 추출
  getTokenExpirationTime: (token: string): number | null => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000; // 밀리초로 변환
    } catch {
      return null;
    }
  },

  // 만료까지 남은 시간 계산 (분 단위)
  getMinutesUntilExpiration: (token: string): number | null => {
    const expTime = tokenUtils.getTokenExpirationTime(token);
    if (!expTime) return null;

    const now = Date.now();
    const minutesLeft = Math.floor((expTime - now) / (1000 * 60));
    return minutesLeft > 0 ? minutesLeft : 0;
  },

  // 토큰이 1분 이내에 만료되는지 확인
  isExpiringSoon: (token: string, thresholdMinutes: number = 1): boolean => {
    const minutesLeft = tokenUtils.getMinutesUntilExpiration(token);
    return (
      minutesLeft !== null && minutesLeft <= thresholdMinutes && minutesLeft > 0
    );
  },
};

// 토큰 저장을 위한 유틸리티 함수들
const tokenStorage = {
  // 액세스 토큰 (localStorage)
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  },
  setAccessToken: (token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("accessToken", token);
  },
  removeAccessToken: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("accessToken");
  },

  // 리프레시 토큰 (sessionStorage)
  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("refreshToken");
  },
  setRefreshToken: (token: string): void => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem("refreshToken", token);
  },
  removeRefreshToken: (): void => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem("refreshToken");
  },

  // 모든 토큰 제거
  clearAllTokens: (): void => {
    tokenStorage.removeAccessToken();
    tokenStorage.removeRefreshToken();
  },
};

// 알림 중복 방지를 위한 플래그
let hasShownExpirationWarning = false;

// 토큰 만료 경고 알림 함수
const showExpirationWarning = () => {
  if (hasShownExpirationWarning) return;

  hasShownExpirationWarning = true;

  // 브라우저 알림 (권한이 있는 경우)
  if (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    new Notification("세션 만료 예정", {
      body: "잠시 후 토큰 만료로 인한 로그아웃이 진행됩니다.",
      icon: "/favicon.ico",
    });
  }

  // 콘솔 로그 (개발 환경)
  console.warn(
    "⚠️ 액세스 토큰이 1분 이내에 만료됩니다. 리프레시 토큰이 없어 자동 갱신이 불가능합니다."
  );

  // 토스트 알림 표시 (5초간 표시)
  if (typeof window !== "undefined") {
    // 동적으로 toastStore import하여 사용
    import("@/stores/toastStore").then(({ useToastStore }) => {
      useToastStore.getState().showWarning(
        "잠시 후 토큰 만료로 인한 로그아웃이 진행됩니다.",
        5000 // 5초간 표시
      );
    });
  }
};

// 경고 플래그 리셋 함수
const resetExpirationWarning = () => {
  hasShownExpirationWarning = false;
};

// 인증 상태 인터페이스
interface AuthState {
  // 상태
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;

  // 액션
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  refreshTokens: () => Promise<boolean>;
  checkAuth: () => Promise<boolean>;
  getTokens: () => { accessToken: string | null; refreshToken: string | null };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      isAuthenticated: false,
      user: null,
      isLoading: false,

      // 로그인
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authService.login({ email, password });

          if (response.accessToken && response.refreshToken) {
            // 토큰을 각각 다른 스토리지에 저장
            tokenStorage.setAccessToken(response.accessToken);
            tokenStorage.setRefreshToken(response.refreshToken);
            // 로그인 시 경고 플래그 리셋
            resetExpirationWarning();

            set({
              isAuthenticated: true,
              user: {
                _id: response._id || "",
                name: "고객", // 임시값, 나중에 getCurrentUser로 업데이트
                email: email,
                profileImg: "/images/user.png",
              },
              isLoading: false,
            });
          } else {
            throw new Error("토큰이 없습니다.");
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // 회원가입
      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          // 1. 회원가입 요청
          await authService.signup({
            name,
            email,
            password,
          });

          // 2. 회원가입 성공 후 자동 로그인
          const loginResponse = await authService.login({ email, password });

          if (loginResponse.accessToken && loginResponse.refreshToken) {
            // 토큰을 각각 다른 스토리지에 저장
            tokenStorage.setAccessToken(loginResponse.accessToken);
            tokenStorage.setRefreshToken(loginResponse.refreshToken);
            // 회원가입 후 로그인 시 경고 플래그 리셋
            resetExpirationWarning();

            set({
              isAuthenticated: true,
              user: {
                _id: loginResponse._id || "",
                name: "고객", // 임시값, 나중에 getCurrentUser로 업데이트
                email: email,
                profileImg: "/images/user.png",
              },
              isLoading: false,
            });
          } else {
            throw new Error("로그인에 실패했습니다.");
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // 로그아웃
      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } catch (error) {
          console.error("로그아웃 요청 실패:", error);
        } finally {
          // 모든 토큰 제거
          tokenStorage.clearAllTokens();

          set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
        }
      },

      // 사용자 정보 설정
      setUser: (user: User) => {
        set({ user });
      },

      // 토큰 설정
      setTokens: (accessToken: string, refreshToken: string) => {
        tokenStorage.setAccessToken(accessToken);
        tokenStorage.setRefreshToken(refreshToken);
        // 토큰이 갱신되면 경고 플래그 리셋
        resetExpirationWarning();
        set({
          isAuthenticated: true,
        });
      },

      // 인증 정보 초기화
      clearAuth: () => {
        tokenStorage.clearAllTokens();
        set({
          isAuthenticated: false,
          user: null,
        });
      },

      // 토큰 갱신
      refreshTokens: async (): Promise<boolean> => {
        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) {
          return false;
        }

        try {
          const response = await authService.refreshTokens(refreshToken);

          if (response.accessToken && response.refreshToken) {
            // 새로운 토큰들을 각각 다른 스토리지에 저장
            tokenStorage.setAccessToken(response.accessToken);
            tokenStorage.setRefreshToken(response.refreshToken);

            set({
              isAuthenticated: true,
            });
            return true;
          }
          return false;
        } catch {
          console.error("토큰 갱신 실패");
          get().clearAuth();
          return false;
        }
      },

      // 인증 상태 확인
      checkAuth: async (): Promise<boolean> => {
        const { isAuthenticated } = get();
        const accessToken = tokenStorage.getAccessToken();
        const refreshToken = tokenStorage.getRefreshToken();

        // 액세스 토큰이 없으면 로그아웃
        if (!accessToken) {
          set({ isAuthenticated: false, user: null });
          return false;
        }

        // 리프레시 토큰이 없으면 액세스 토큰만으로 검증
        if (!refreshToken) {
          console.log(
            "⚠️ 리프레시 토큰이 없습니다. 액세스 토큰만으로 검증합니다."
          );

          // 액세스 토큰 만료 경고 체크
          if (accessToken && tokenUtils.isExpiringSoon(accessToken, 1)) {
            showExpirationWarning();
          }

          if (!isAuthenticated) {
            return false;
          }

          try {
            // 현재 사용자 정보 조회로 액세스 토큰 유효성 확인
            const user = await authService.getCurrentUser();
            set({ user });
            return true;
          } catch {
            // 액세스 토큰이 만료되었고 리프레시 토큰도 없으면 로그아웃
            console.log(
              "❌ 액세스 토큰이 만료되었고 리프레시 토큰이 없어 로그아웃합니다."
            );
            set({ isAuthenticated: false, user: null });
            return false;
          }
        }

        // 두 토큰이 모두 있는 경우 (기존 로직)
        if (!isAuthenticated) {
          return false;
        }

        try {
          // 현재 사용자 정보 조회로 토큰 유효성 확인
          const user = await authService.getCurrentUser();
          set({ user });
          return true;
        } catch {
          // 토큰이 만료된 경우 갱신 시도
          const refreshed = await get().refreshTokens();
          if (refreshed) {
            try {
              const user = await authService.getCurrentUser();
              set({ user });
              return true;
            } catch (userError) {
              console.error("사용자 정보 조회 실패:", userError);
              return false;
            }
          }
          return false;
        }
      },

      // 토큰 조회
      getTokens: () => {
        return {
          accessToken: tokenStorage.getAccessToken(),
          refreshToken: tokenStorage.getRefreshToken(),
        };
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // 토큰은 별도 스토리지에 저장하므로 user와 isAuthenticated만 저장
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
