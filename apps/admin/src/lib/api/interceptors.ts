import axiosInstance from "./axios";
import { AuthService } from "./auth";
import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestHeaders,
} from "axios";

// _retry 플래그를 안전하게 추가
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export function setupInterceptors(): void {
  // 요청 인터셉터
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      if (typeof window !== "undefined") {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          // headers를 타입 안전하게 업데이트
          const headers = (config.headers ?? {}) as AxiosRequestHeaders;
          headers.Authorization = `Bearer ${accessToken}`;
          config.headers = headers;
        }
      }
      return config;
    },
    (error: AxiosError): Promise<never> => Promise.reject(error)
  );

  // 응답 인터셉터
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => response,
    async (error: AxiosError): Promise<never | AxiosResponse> => {
      const status = error.response?.status;
      const original = error.config as RetriableConfig | undefined;

      // 401 & 아직 재시도 안했으면 → 리프레시
      if (status === 401 && original && !original._retry) {
        original._retry = true;

        try {
          const newAccessToken = await AuthService.refreshAccessToken();
          localStorage.setItem("accessToken", newAccessToken);

          // 원 요청 헤더 갱신
          const headers = (original.headers ?? {}) as AxiosRequestHeaders;
          headers.Authorization = `Bearer ${newAccessToken}`;
          original.headers = headers;

          return axiosInstance(original);
        } catch (refreshErr) {
          // 리프레시 실패 → 세션 정리
          localStorage.removeItem("accessToken");
          // (리프레시는 쿠키라 지울 필요 없음; 서버가 /logout에서 쿠키 제거)
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return Promise.reject(refreshErr);
        }
      }

      return Promise.reject(error);
    }
  );
}
