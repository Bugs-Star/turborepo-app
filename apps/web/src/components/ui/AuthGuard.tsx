"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/layout";
import { tokenManager } from "@/lib/api";

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

  // 비로그인 상태 체크 및 리다이렉트
  useEffect(() => {
    if (!tokenManager.hasTokens()) {
      // 잠시 로딩 화면을 보여주기 위해 약간의 지연
      const timer = setTimeout(() => {
        router.push("/login?message=login_required");
      }, 800);

      return () => clearTimeout(timer);
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  // 비로그인 상태이면 로딩 화면 표시
  if (!tokenManager.hasTokens()) {
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
