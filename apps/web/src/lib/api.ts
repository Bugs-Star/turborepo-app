import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

// HTTP 클라이언트 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초 타임아웃
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 토큰 가져오기
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData인 경우 Content-Type을 자동으로 설정하지 않음 (브라우저가 자동 설정)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    console.log("🚀 API Request:", config.method?.toUpperCase(), config.url);
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
    console.log("✅ API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error(
      "❌ Response Error:",
      error.response?.status,
      error.config?.url
    );

    // 에러 처리
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // 인증 에러 - 로그인 페이지로 리다이렉트
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
          break;
        case 403:
          // 권한 에러
          console.error("권한이 없습니다.");
          break;
        case 404:
          // 리소스 없음
          console.error("요청한 리소스를 찾을 수 없습니다.");
          break;
        case 500:
          // 서버 에러
          console.error("서버 오류가 발생했습니다.");
          break;
        default:
          console.error("알 수 없는 오류가 발생했습니다.");
      }
    } else if (error.request) {
      // 네트워크 에러
      console.error("네트워크 연결을 확인해주세요.");
    } else {
      // 기타 에러
      console.error("요청 설정 중 오류가 발생했습니다.");
    }

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

// 토큰 관리 함수들
export const tokenManager = {
  // 토큰 저장
  setToken: (token: string) => {
    localStorage.setItem("accessToken", token);
  },

  // 토큰 가져오기
  getToken: () => {
    return localStorage.getItem("accessToken");
  },

  // 토큰 삭제
  removeToken: () => {
    localStorage.removeItem("accessToken");
  },

  // 토큰 존재 여부 확인
  hasToken: () => {
    return !!localStorage.getItem("accessToken");
  },
};

export default apiClient;
