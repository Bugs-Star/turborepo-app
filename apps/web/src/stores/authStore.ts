import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, authService } from "@/lib";

// 인증 상태 인터페이스
interface AuthState {
  // 상태
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;

  // 액션
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      isAuthenticated: false,
      user: null,
      accessToken: null,
      isLoading: false,

      // 로그인
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authService.login({ email, password });

          if (response.accessToken) {
            set({
              isAuthenticated: true,
              accessToken: response.accessToken,
              user: {
                _id: response._id || "",
                name: "고객", // 임시값, 나중에 getCurrentUser로 업데이트
                email: email,
                profileImg: "/images/user.png",
              },
              isLoading: false,
            });
          } else {
            throw new Error("액세스 토큰이 없습니다.");
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
          await authService.signup({ name, email, password });
          const loginResponse = await authService.login({ email, password });

          if (loginResponse.accessToken) {
            set({
              isAuthenticated: true,
              accessToken: loginResponse.accessToken,
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
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            isLoading: false,
          });
        }
      },

      // 사용자 정보 설정
      setUser: (user: User) => {
        set({ user });
      },

      // 액세스 토큰 설정 (토큰 갱신 시 인터셉터가 호출)
      setAccessToken: (accessToken: string) => {
        set({ accessToken, isAuthenticated: true });
      },

      // 인증 정보 초기화 (토큰 갱신 실패 시 인터셉터가 호출)
      clearAuth: () => {
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
        });
      },

      // 인증 상태 확인 (앱 시작 시)
      checkAuth: async (): Promise<boolean> => {
        const { accessToken } = get();

        if (!accessToken) {
          get().clearAuth();
          return false;
        }

        set({ isAuthenticated: true });
        try {
          const user = await authService.getCurrentUser();
          set({ user });
          return true;
        } catch (error) {
          console.error("CheckAuth 실패:", error);
          return false;
        }
      },
    }),
    {
      name: "auth-storage", // localStorage에 저장될 때 사용될 키
      storage: createJSONStorage(() => localStorage),
      // user, isAuthenticated, accessToken 상태만 localStorage에 저장
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
      }),
    }
  )
);
