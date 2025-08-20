import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, authService } from "@/lib";

// 인증 상태 인터페이스
interface AuthState {
  // 상태
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
  };

  // 액션
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  refreshTokens: () => Promise<boolean>;
  checkAuth: () => Promise<boolean>;
}

// 기본 사용자 정보
const defaultUser: User = {
  _id: "",
  name: "고객",
  email: "",
  profileImg: "/images/user.png",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      isAuthenticated: false,
      user: null,
      isLoading: false,
      tokens: {
        accessToken: null,
        refreshToken: null,
      },

      // 로그인
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authService.login({ email, password });

          if (response.accessToken && response.refreshToken) {
            set({
              isAuthenticated: true,
              tokens: {
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
              },
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
          const signupResponse = await authService.signup({
            name,
            email,
            password,
          });

          // 2. 회원가입 성공 후 자동 로그인
          const loginResponse = await authService.login({ email, password });

          if (loginResponse.accessToken && loginResponse.refreshToken) {
            set({
              isAuthenticated: true,
              tokens: {
                accessToken: loginResponse.accessToken,
                refreshToken: loginResponse.refreshToken,
              },
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
            tokens: {
              accessToken: null,
              refreshToken: null,
            },
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
        set({
          tokens: { accessToken, refreshToken },
          isAuthenticated: true,
        });
      },

      // 인증 정보 초기화
      clearAuth: () => {
        set({
          isAuthenticated: false,
          user: null,
          tokens: {
            accessToken: null,
            refreshToken: null,
          },
        });
      },

      // 토큰 갱신
      refreshTokens: async (): Promise<boolean> => {
        const { tokens } = get();
        if (!tokens.refreshToken) {
          return false;
        }

        try {
          const response = await authService.refreshTokens(tokens.refreshToken);

          if (response.accessToken && response.refreshToken) {
            set({
              tokens: {
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
              },
              isAuthenticated: true,
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error("토큰 갱신 실패:", error);
          get().clearAuth();
          return false;
        }
      },

      // 인증 상태 확인
      checkAuth: async (): Promise<boolean> => {
        const { tokens, isAuthenticated } = get();

        if (!tokens.accessToken || !tokens.refreshToken) {
          set({ isAuthenticated: false, user: null });
          return false;
        }

        if (!isAuthenticated) {
          return false;
        }

        try {
          // 현재 사용자 정보 조회로 토큰 유효성 확인
          const user = await authService.getCurrentUser();
          set({ user });
          return true;
        } catch (error) {
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
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // 민감한 정보는 제외하고 저장
      partialize: (state) => ({
        tokens: state.tokens,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
