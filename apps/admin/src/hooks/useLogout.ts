// src/hooks/useLogout.ts
"use client";

import { useRouter } from "next/navigation";
import { QueryClient } from "@tanstack/react-query";
import { AuthService } from "@/lib/api/auth";

const useLogout = () => {
  const router = useRouter();
  const queryClient = new QueryClient();

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const accessToken = localStorage.getItem("accessToken");

      if (refreshToken && accessToken) {
        await AuthService.logout(refreshToken, accessToken);
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

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      queryClient.clear();
      router.push("/login");
    }
  };

  return { logout };
};

export default useLogout;
