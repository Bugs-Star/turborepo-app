"use client";

import { LogOut } from "lucide-react";
import { Button } from "@repo/ui";
import { useAuthStore } from "@/stores/authStore";

interface LogoutButtonProps {
  onLogout?: () => void;
  onLogoutStart?: () => void;
}

export default function LogoutButton({
  onLogout,
  onLogoutStart,
}: LogoutButtonProps) {
  const { logout, isLoading } = useAuthStore();

  const handleLogout = async () => {
    try {
      // 로그아웃 시작 시 콜백 호출 (로그 생성 + 강제 전송)
      if (onLogoutStart) {
        await onLogoutStart(); // async로 변경
      }

      // 실제 로그아웃 처리
      await logout();

      if (onLogout) {
        onLogout();
      }

      // 로그 전송 완료 후 로그인 페이지로 리다이렉트
      window.location.href = "/login";
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      // 오류가 발생해도 클라이언트에서 토큰을 삭제하고 로그인 페이지로 이동
      window.location.href = "/login";
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="red"
      size="md"
      fullWidth
      className="rounded-lg"
      disabled={isLoading}
    >
      <LogOut className="w-4 h-4 mr-2" />
      {isLoading ? "로그아웃 중..." : "로그아웃"}
    </Button>
  );
}
