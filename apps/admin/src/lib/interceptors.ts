import axiosInstance from "./axios";

export function setupInterceptors() {
  // 요청 인터셉터
  axiosInstance.interceptors.request.use((config) => {
    const token =
      typeof window !== "undefined"
        ? sessionStorage.getItem("accessToken")
        : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
          const refreshToken = sessionStorage.getItem("refreshToken");
          if (!refreshToken) throw new Error("No refresh token");

          const res = await axiosInstance.post("/admin/refresh", {
            refreshToken,
          });
          const newAccessToken = res.data.accessToken;

          sessionStorage.setItem("accessToken", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          sessionStorage.clear();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(err);
    }
  );
}
