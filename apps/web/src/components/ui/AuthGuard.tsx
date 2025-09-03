"use client";

import { useEffect, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useHydration } from "@/hooks";

interface AuthGuardProps {
  children: ReactNode;
  title?: string;
  backgroundColor?: string;
  showHeader?: boolean;
}

export const AuthGuard = ({
  children,
  title,
  backgroundColor = "bg-white",
  showHeader = false,
}: AuthGuardProps) => {
  const router = useRouter();
  const isClient = useHydration();
  const { isAuthenticated, checkAuth } = useAuthStore();

  // 인증 상태 확인
  const verifyAuth = useCallback(async () => {
    if (!isClient) return;

    try {
      const isValid = await checkAuth();
      if (!isValid) {
        router.push("/login");
      }
    } catch (error) {
      console.error("인증 확인 중 오류:", error);
      router.push("/login");
    }
  }, [isClient, checkAuth, router]);

  useEffect(() => {
    if (isClient) {
      verifyAuth();
    }
  }, [isClient, verifyAuth]);

  // 서버에서는 빈 화면으로 시작
  if (!isClient) {
    return null;
  }

  // 비로그인 상태면 빈 화면 (즉시 리다이렉트되므로)
  if (!isAuthenticated) {
    return null;
  }

  // 로그인된 상태이면 자식 컴포넌트 렌더링
  return <>{children}</>;
};
