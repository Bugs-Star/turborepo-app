"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@/lib/api/auth";
import { notify } from "@/lib/notify";

const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const inFlight = useRef(false);

  const logout = useCallback(async (): Promise<void> => {
    if (inFlight.current) return; // 중복 클릭 가드
    inFlight.current = true;

    try {
      const accessToken =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

      if (accessToken) {
        try {
          await AuthService.logout(accessToken);
          notify.success("로그아웃 되었습니다.");
        } catch (e) {
          // 서버 실패해도 클라이언트 정리는 계속
          console.warn("Logout API failed:", e);
          notify.info("세션 정리 중입니다.");
        }
      }
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }

      queryClient.clear();

      router.replace("/login");

      inFlight.current = false;
    }
  }, [queryClient, router]);

  return { logout };
};

export default useLogout;
