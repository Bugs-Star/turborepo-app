"use client";

import { useEffect, useRef } from "react";
import { Logo } from "@/components/ui";
import { SignupForm } from "@/components/forms";
import { BottomNavigation } from "@/components/layout";
import { useAnalytics } from "@/hooks";

export default function SignupPage() {
  // 로거 훅
  const { trackPageView } = useAnalytics();

  // 중복 로깅 방지를 위한 ref
  const hasLoggedPageView = useRef(false);

  // 페이지 로드 시 페이지 뷰 로그 (브라우저에서만 실행, 한 번만)
  useEffect(() => {
    if (typeof window !== "undefined" && !hasLoggedPageView.current) {
      trackPageView("/signup");
      hasLoggedPageView.current = true;
    }
  }, [trackPageView]);

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Logo */}
        <div className="mb-8">
          <Logo size="lg" />
        </div>

        {/* Signup Form */}
        <SignupForm />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
