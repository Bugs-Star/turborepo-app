// src/lib/auth.ts
import axiosInstance from "@/lib/axios";

// --- 로그인 관련 타입 ---
export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  adminName: string;
}

// --- 인증 API 서비스 ---
export const AuthService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(
      "/admin/login",
      payload
    );
    return response.data;
  },

  logout: async (refreshToken: string, accessToken: string) => {
    await axiosInstance.post(
      "/admin/logout",
      { refreshToken },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  },

  refreshAccessToken: async (refreshToken: string) => {
    const response = await axiosInstance.post("/admin/refresh", {
      refreshToken,
    });
    return response.data;
  },
};
