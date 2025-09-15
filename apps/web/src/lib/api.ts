import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { handleError } from "./errorHandler";
import { AxiosErrorResponse } from "@/types";
import { useAuthStore } from "@/stores/authStore";

// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

// HTTP 클라이언트 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초 타임아웃
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // cross-origin 요청에 쿠키를 포함시키기 위한 설정
});

// 토큰 갱신 중인지 확인하는 플래그
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}> = [];

// 대기 중인 요청들을 처리하는 함수
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// 토큰 갱신 처리 함수 (쿠키 기반)
const handleTokenRefresh = async (originalRequest: AxiosRequestConfig) => {
  try {
    console.log("🔄 토큰 갱신 시도...");

    // 토큰 갱신 요청 (쿠키가 자동으로 전송됨)
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`);

    const { accessToken } = response.data;

    // Zustand store 상태 업데이트
    const { useAuthStore } = await import("@/stores/authStore");
    useAuthStore.getState().setAccessToken(accessToken);

    console.log("✅ 토큰 갱신 성공");

    // 대기 중인 요청들 처리
    processQueue(null, accessToken);

    // 원래 요청 재시도
    if (originalRequest.headers) {
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    }
    return apiClient(originalRequest);
  } catch (refreshError: unknown) {
    console.error(
      "❌ 토큰 갱신 실패:",
      (refreshError as AxiosErrorResponse)?.response?.data ||
        (refreshError as Error)?.message
    );
    
    // 리프레시 토큰이 만료되었거나 유효하지 않은 경우, 서버는 401을 반환함.
    // 이 경우, 모든 인증 상태를 클리어하고 로그인 페이지로 리디렉션.

    // 사용자에게 알림
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification("세션 만료", {
        body: "로그인 세션이 만료되었습니다. 다시 로그인해주세요.",
        icon: "/favicon.ico",
      });
    }

    // 잠시 후 로그아웃 처리
    setTimeout(async () => {
      processQueue(refreshError, null);
      const { useAuthStore } = await import("@/stores/authStore");
      useAuthStore.getState().clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/login?message=session_expired";
      }
    }, 1000); // 딜레이를 줄여 더 빠른 피드백 제공

    return Promise.reject(refreshError);
  } finally {
    isRefreshing = false;
  }
};

// 요청 인터셉터
apiClient.interceptors.request.use(
  async (config) => {
    // Zustand 스토어에서 액세스 토큰 가져오기
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // FormData인 경우 Content-Type을 자동으로 설정하지 않음 (브라우저가 자동 설정)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    // 401 에러는 토큰 갱신 과정에서 발생하는 정상적인 현상이므로 조용히 처리
    if (error.response?.status === 409 && error.response?.data?.code === 'DUPLICATE_ORDER_NUMBER' && error.config?.url?.includes('/order')) {
      // 중복 주문 번호 오류는 조용히 처리하고, 사용자에게는 별도의 메시지를 표시할 수 있도록 함
      console.warn("⚠️ Duplicate Order Number Error:", error.response?.data?.message);
      return Promise.reject(error); // 에러를 계속 전파하여 호출하는 쪽에서 처리할 수 있도록 함
    }

    if (error.response?.status !== 401) {
      console.error(
        "❌ Response Error:",
        error.response?.status,
        error.config?.url
      );
    }

    const originalRequest = error.config;

    // 401 에러이고 토큰 갱신 요청이 아닌 경우에만 토큰 갱신 시도
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        // 이미 토큰 갱신 중이면 대기열에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // 토큰 갱신 처리 함수 호출
      return handleTokenRefresh(originalRequest);
    }

    // 통합 에러 핸들러로 에러 처리
    const context = `API_${error.config?.method?.toUpperCase() || "UNKNOWN"}_${error.config?.url || "unknown"}`;
    handleError(error, context);

    return Promise.reject(error);
  }
);

// API 메서드들
export const api = {
  // GET 요청
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((response) => response.data),

  // POST 요청
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((response) => response.data),

  // PUT 요청
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((response) => response.data),

  // PATCH 요청
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then((response) => response.data),

  // DELETE 요청
  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((response) => response.data),
};

export default apiClient;
