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
  const verifyAuth = async () => {
    if (!isClient) return;

    try {
      const isValid = await checkAuth();
      if (!isValid) {
        showWarning("로그인이 필요한 서비스입니다.");
        // 사용자가 경고 메시지를 읽을 수 있도록 적절한 지연
        setTimeout(() => {
          router.push("/login");
        }, 400);
      } else {
        setIsCheckingAuth(false);
      }
    } catch (error) {
      console.error("인증 확인 중 오류:", error);
      showWarning("로그인이 필요한 서비스입니다.");
      setTimeout(() => {
        router.push("/login");
      }, 400);
    }
  };

  useEffect(() => {
    if (isClient) {
      verifyAuth();
    }
  }, [isClient]);

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
