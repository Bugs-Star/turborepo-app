"use client";

import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { QueryClient } from "@tanstack/react-query";

const useLogout = () => {
  const router = useRouter();
  const queryClient = new QueryClient();

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const accessToken = localStorage.getItem("accessToken");

      if (!refreshToken || !accessToken) {
        console.warn("No tokens found, just clearing storage");
      } else {
        await axiosInstance.post(
          "/admin/logout",
          { refreshToken },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      }

      // localStorage 정리
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // react-query 캐시 비우기
      queryClient.clear();

      // 로그인 페이지로 이동
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // 실패하더라도 토큰은 제거하고 로그인 페이지로 이동
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      queryClient.clear();
      router.push("/login");
    }
  };

  return { logout };
};

export default useLogout;
