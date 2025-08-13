"use client";

import { LogOut } from "lucide-react";
import { Button } from "@repo/ui";

interface LogoutButtonProps {
  onLogout?: () => void;
}

export default function LogoutButton({ onLogout }: LogoutButtonProps) {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // 기본 로그아웃 로직
      console.log("로그아웃 처리");
    }
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
