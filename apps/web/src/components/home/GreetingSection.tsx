"use client";

import { useEffect, useCallback } from "react";
import { PageHeader } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { useHydration } from "@/hooks";

export default function GreetingSection() {
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const isClient = useHydration();

  // 인증 상태 확인 (한 번만 실행)
  const verifyAuth = useCallback(async () => {
    if (isClient && isAuthenticated) {
      await checkAuth();
    }
  }, [isClient, isAuthenticated, checkAuth]);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  // 서버 사이드 렌더링 중이거나 클라이언트가 아직 로드되지 않았을 때
  if (!isClient) {
    return (
      <PageHeader
        title="고객님, 향긋한 하루 보내세요!"
        variant="greeting"
        showBackButton={true}
        hideOnScroll={true}
      />
    );
  }

  // 로그인된 사용자의 경우
  if (isAuthenticated && user) {
    const userName = user.name || "고객";
    return (
      <PageHeader
        title={`${userName}님, 향긋한 하루 보내세요!`}
        variant="greeting"
        showBackButton={true}
        hideOnScroll={true}
      />
    );
  }

  // 비로그인 상태이거나 사용자 정보가 없는 경우
  return (
    <PageHeader
      title="고객님, 향긋한 하루 보내세요!"
      variant="greeting"
      showBackButton={true}
      hideOnScroll={true}
    />
  );
}
