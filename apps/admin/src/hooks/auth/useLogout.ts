"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AuthService, STORAGE_KEYS } from "@/lib/api/auth";
import { notify } from "@/lib/notify";

const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const inFlight = useRef(false);

  const logout = useCallback(async (): Promise<void> => {
    if (inFlight.current) return;
    inFlight.current = true;

    try {
      const access =
        typeof window !== "undefined"
          ? (localStorage.getItem(STORAGE_KEYS.access) ?? "")
          : "";
      const refresh =
        typeof window !== "undefined"
          ? (localStorage.getItem(STORAGE_KEYS.refresh) ?? "")
          : "";

      try {
        await AuthService.logout();
        notify.success("로그아웃 되었습니다.");
      } catch (e) {
        console.warn("Logout API failed:", e, { access, refresh });
        notify.info("세션 정리 중입니다.");
      }
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEYS.access);
        localStorage.removeItem(STORAGE_KEYS.refresh);
      }

      try {
        await queryClient.cancelQueries();
      } catch {}
      queryClient.clear();

      // 3) 로그인 페이지로 이동
      router.replace("/login");

      inFlight.current = false;
    }
  }, [queryClient, router]);

  return { logout };
};

export default useLogout;
