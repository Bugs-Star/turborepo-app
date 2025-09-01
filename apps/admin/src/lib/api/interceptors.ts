import axiosInstance from "./axios";
import { AuthService } from "./auth";

export function setupInterceptors() {
  // **요청 인터셉터**
  axiosInstance.interceptors.request.use(
    (config) => {
      if (typeof window !== "undefined") {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          config.headers?.set("Authorization", `Bearer ${accessToken}`);
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // **응답 인터셉터**
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // 401 처리 + 무한 루프 방지
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) throw new Error("No refresh token available");

          // 새 accessToken 발급
          const { accessToken: newAccessToken } =
            await AuthService.refreshAccessToken(refreshToken);

          // 로컬스토리지 갱신
          localStorage.setItem("accessToken", newAccessToken);

          // 원래 요청에 새로운 토큰 설정 후 재요청
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newAccessToken}`,
          };

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);

          // 토큰 갱신 실패 → 세션 초기화 및 로그인 페이지 이동
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";

          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
}
