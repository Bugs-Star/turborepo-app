// apps/admin/src/lib/api/interceptors.ts
import axiosInstance from "./axios";
import { AuthService, STORAGE_KEYS } from "./auth";
import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestHeaders,
} from "axios";

// _retry 플래그 안전 추가
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const LOGIN_URL = "/admin/login";
const REFRESH_URL = "/admin/refresh";
const LOGOUT_URL = "/admin/logout";

const isNoAuth = (url?: string) =>
  !!url &&
  (url.endsWith(LOGIN_URL) ||
    url.endsWith(REFRESH_URL) ||
    url.endsWith(LOGOUT_URL));

export function setupInterceptors(): void {
  // 요청 인터셉터: accessToken 자동 부착 (단, refresh/login/logout은 제외)
  axiosInstance.interceptors.request.use(
    (config) => {
      if (!isNoAuth(config.url) && typeof window !== "undefined") {
        const accessToken =
          localStorage.getItem(STORAGE_KEYS.access) ?? undefined;
        if (accessToken) {
          const headers = (config.headers ?? {}) as AxiosRequestHeaders;
          headers.Authorization = `Bearer ${accessToken}`;
          config.headers = headers;
        }
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // 응답 인터셉터: 401이면 1회에 한해 리프레시 → 원요청 재시도
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError): Promise<AxiosResponse | never> => {
      const status = error.response?.status;
      const original = error.config as RetriableConfig | undefined;
      const url = original?.url;

      // 리프레시 자체가 실패(만료)하면 바로 세션 종료
      if (
        (status === 401 || status === 403) &&
        url &&
        url.endsWith(REFRESH_URL)
      ) {
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEYS.access);
          localStorage.removeItem(STORAGE_KEYS.refresh);
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      if (status === 401 && original && !original._retry) {
        // 로그인/리프레시/로그아웃 요청은 스킵
        if (isNoAuth(url)) return Promise.reject(error);

        original._retry = true;

        try {
          const newAccessToken = await AuthService.refreshAccessToken();
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEYS.access, newAccessToken);
          }

          const headers = (original.headers ?? {}) as AxiosRequestHeaders;
          headers.Authorization = `Bearer ${newAccessToken}`;
          original.headers = headers;

          return axiosInstance(original);
        } catch (refreshErr) {
          if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_KEYS.access);
            localStorage.removeItem(STORAGE_KEYS.refresh);
            window.location.href = "/login";
          }
          return Promise.reject(refreshErr);
        }
      }

      return Promise.reject(error);
    }
  );
}
