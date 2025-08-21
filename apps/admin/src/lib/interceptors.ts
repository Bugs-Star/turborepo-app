import axiosInstance from "./axios";
import { AuthService } from "./auth";

export function setupInterceptors() {
  // 요청 인터셉터
  axiosInstance.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  });

  // 응답 인터셉터
  axiosInstance.interceptors.response.use(
    (res) => res,
    async (err) => {
      const originalRequest = err.config;

      if (err.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) throw new Error("No refresh token");

          // AuthService 활용해서 새 액세스 토큰 발급
          const data = await AuthService.refreshAccessToken(refreshToken);
          const newAccessToken = data.accessToken;

          // localStorage 갱신
          localStorage.setItem("accessToken", newAccessToken);

          // 원래 요청 헤더 업데이트 후 재요청
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // 리프레시 실패 시 세션 초기화 후 로그인 페이지 이동
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(err);
    }
  );
}
