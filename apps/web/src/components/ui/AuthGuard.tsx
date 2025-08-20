"use client";

import { useEffect, useState, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/layout";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/useToast";
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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const isClient = useHydration();

  const { isAuthenticated, checkAuth } = useAuthStore();
  const { showWarning } = useToast();

  // 인증 상태 확인
  const verifyAuth = useCallback(async () => {
    if (!isClient) return;

    try {
      const isValid = await checkAuth();
      if (!isValid) {
        showWarning("로그인이 필요한 서비스입니다.");
        // 잠시 로딩 화면을 보여주기 위해 약간의 지연
        const timer = setTimeout(() => {
          router.push("/login");
        }, 800);

        return () => clearTimeout(timer);
      } else {
        setIsCheckingAuth(false);
      }
    } catch (error) {
      console.error("인증 확인 중 오류:", error);
      showWarning("로그인이 필요한 서비스입니다.");
      const timer = setTimeout(() => {
        router.push("/login");
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [router, isClient, checkAuth, showWarning]);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  // 서버에서는 항상 로딩 상태로 시작하여 하이드레이션 오류 방지
  if (!isClient) {
    return (
      <div className={`min-h-screen ${backgroundColor} flex flex-col pb-20`}>
        {showHeader && title && (
          <div className="px-4 py-4 border-b border-gray-200">
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">로그인 확인 중...</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // 비로그인 상태이거나 인증 확인 중이면 로딩 화면 표시
  if (!isAuthenticated || isCheckingAuth) {
    return (
      <div className={`min-h-screen ${backgroundColor} flex flex-col pb-20`}>
        {showHeader && title && (
          <div className="px-4 py-4 border-b border-gray-200">
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">로그인 확인 중...</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // 로그인된 상태이면 자식 컴포넌트 렌더링
  return <>{children}</>;
};
