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

// 토큰 갱신 중인지 확인하는 플래그
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

// 대기 중인 요청들을 처리하는 함수
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

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
  async (error) => {
    console.error(
      "❌ Response Error:",
      error.response?.status,
      error.config?.url
    );

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

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // 리프레시 토큰이 없으면 로그인 페이지로 리다이렉트
        processQueue(new Error("No refresh token"), null);
        isRefreshing = false;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // 토큰 갱신 요청
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // 새로운 토큰들을 저장
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // 대기 중인 요청들 처리
        processQueue(null, accessToken);

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 에러 처리
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // 인증 에러 - 이미 위에서 처리됨
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
  // 액세스 토큰 저장
  setAccessToken: (token: string) => {
    localStorage.setItem("accessToken", token);
  },

  // 리프레시 토큰 저장
  setRefreshToken: (token: string) => {
    localStorage.setItem("refreshToken", token);
  },

  // 액세스 토큰 가져오기
  getAccessToken: () => {
    return localStorage.getItem("accessToken");
  },

  // 리프레시 토큰 가져오기
  getRefreshToken: () => {
    return localStorage.getItem("refreshToken");
  },

  // 모든 토큰 삭제
  removeAllTokens: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  // 토큰 존재 여부 확인
  hasTokens: () => {
    return !!(
      localStorage.getItem("accessToken") &&
      localStorage.getItem("refreshToken")
    );
  },

  // 기존 호환성을 위한 함수들
  setToken: (token: string) => {
    localStorage.setItem("accessToken", token);
  },

  getToken: () => {
    return localStorage.getItem("accessToken");
  },

  removeToken: () => {
    localStorage.removeItem("accessToken");
  },

  hasToken: () => {
    return !!localStorage.getItem("accessToken");
  },
};

export default apiClient;
