// apps/admin/src/lib/api/auth.ts
import axios from "axios";
import axiosInstance from "./axios";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  adminName?: string;
  _id?: string;
}

export const STORAGE_KEYS = {
  access: "accessToken",
  refresh: "refreshToken",
} as const;

// 인터셉터가 전혀 없는 전용 인스턴스 (리프레시용, 재귀 방지)
const axiosRefresh = axios.create({
  baseURL: (axiosInstance.defaults as unknown as { baseURL?: string }).baseURL,
});

export const AuthService = {
  /** 로그인: 토큰 저장까지 포함 */
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await axiosInstance.post<LoginResponse>(
      "/admin/login",
      payload
    );

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.access, data.accessToken);
      localStorage.setItem(STORAGE_KEYS.refresh, data.refreshToken);
    }
    return data;
  },

  /** 리프레시: Body에 refreshToken을 넣어 새 accessToken을 발급 */
  async refreshAccessToken(): Promise<string> {
    const refreshToken =
      typeof window !== "undefined"
        ? (localStorage.getItem(STORAGE_KEYS.refresh) ?? "")
        : "";

    if (!refreshToken) {
      throw new Error("NO_REFRESH_TOKEN");
    }

    const { data } = await axiosRefresh.post<{
      accessToken: string;
      refreshToken?: string;
    }>(
      "/admin/refresh",
      { refreshToken },
      { headers: { Authorization: "" } } // 혹시 기본 Authorization이 섞이지 않게 방어
    );

    if (data.refreshToken && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.refresh, data.refreshToken);
    }
    return data.accessToken;
  },

  /** 로그아웃: 서버 통보 후 로컬 토큰 제거 */
  async logout(): Promise<void> {
    const accessToken =
      typeof window !== "undefined"
        ? (localStorage.getItem(STORAGE_KEYS.access) ?? undefined)
        : undefined;
    const refreshToken =
      typeof window !== "undefined"
        ? (localStorage.getItem(STORAGE_KEYS.refresh) ?? "")
        : "";

    try {
      await axiosInstance.post(
        "/admin/logout",
        { refreshToken },
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        }
      );
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEYS.access);
        localStorage.removeItem(STORAGE_KEYS.refresh);
      }
    }
  },
};
