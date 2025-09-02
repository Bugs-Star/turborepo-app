"use client";

import { useEffect, useRef } from "react";
import { Logo } from "@/components/ui";
import { LoginForm } from "@/components/forms";
import { BottomNavigation } from "@/components/layout";
import { useAnalytics } from "@/hooks";

export default function LoginPage() {
  // 로거 훅
  const { trackScreenView } = useAnalytics();

  // 중복 로깅 방지를 위한 ref
  const hasLoggedScreenView = useRef(false);

  // 페이지 로드 시 화면 조회 로그 (브라우저에서만 실행, 한 번만)
  useEffect(() => {
    if (typeof window !== "undefined" && !hasLoggedScreenView.current) {
      trackScreenView("/login");
      hasLoggedScreenView.current = true;
    }
  }, [trackScreenView]);

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col pb-20">
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          {/* Logo */}
          <div className="mb-8">
            <Logo size="lg" priority={true} />
          </div>

          {/* Login Form */}
          <LoginForm />
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </>
  );
}
