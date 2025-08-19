"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui";
import { LoginForm } from "@/components/forms";
import { BottomNavigation } from "@/components/layout";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const { toast, showWarning, hideToast } = useToast();

  // URL 쿼리 파라미터 확인 및 토스트 메시지 표시
  useEffect(() => {
    const message = searchParams.get("message");
    if (message === "login_required") {
      showWarning("로그인이 필요한 서비스입니다.");
    } else if (message === "session_expired") {
      showWarning("세션이 만료되었습니다. 다시 로그인해주세요.");
    }
  }, [searchParams, showWarning]);

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col pb-20">
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          {/* Logo */}
          <div className="mb-8">
            <Logo size="lg" />
          </div>

          {/* Login Form */}
          <LoginForm />
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>

      {/* Toast 컴포넌트 */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </>
  );
}
