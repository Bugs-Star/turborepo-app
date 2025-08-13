"use client";

import { LogOut } from "lucide-react";
import { Button } from "@repo/ui";
import { authService } from "@/lib";

interface LogoutButtonProps {
  onLogout?: () => void;
}

export default function LogoutButton({ onLogout }: LogoutButtonProps) {
  const handleLogout = () => {
    // 실제 로그아웃 처리
    authService.logout();

    if (onLogout) {
      onLogout();
    }

    // 로그인 페이지로 리다이렉트
    window.location.href = "/login";
  };

  return (
    <Button
      onClick={handleLogout}
      variant="red"
      size="md"
      fullWidth
      className="rounded-lg"
    >
      <LogOut className="w-4 h-4 mr-2" />
      로그아웃
    </Button>
  );
}
