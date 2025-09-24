import axiosInstance from "@/lib/api/axios";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  adminName: string;
}

export const AuthService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(
      "/admin/login",
      payload
    );
    return response.data;
  },

  logout: async (accessToken: string) => {
    await axiosInstance.post(
      "/admin/logout",
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  },

  refreshAccessToken: async (): Promise<string> => {
    const { data } = await axiosInstance.post<{ accessToken: string }>(
      "/admin/refresh"
    );
    return data.accessToken;
  },
};
