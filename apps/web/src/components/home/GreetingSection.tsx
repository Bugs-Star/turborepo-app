"use client";

import { useEffect, useState } from "react";
import { useProfileFetch } from "@/hooks/useProfileFetch";
import { PageHeader } from "@/components/ui";
import { tokenManager } from "@/lib/api";

export default function GreetingSection() {
  const { user, loading } = useProfileFetch();
  const [hasTokens, setHasTokens] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setHasTokens(tokenManager.hasTokens());
  }, []);

  // 서버 사이드 렌더링 중이거나 클라이언트가 아직 로드되지 않았을 때
  if (!isClient) {
    return (
      <PageHeader
        title="고객님, 향긋한 하루 보내세요!"
        variant="greeting"
        showBackButton={true}
      />
    );
  }

  // 로딩 중이거나 토큰이 있는 상태에서 로딩 중일 때
  if (loading && hasTokens) {
    return (
      <PageHeader
        title="고객님, 향긋한 하루 보내세요!"
        variant="greeting"
        showBackButton={true}
        className="animate-pulse"
      />
    );
  }

  // 비로그인 상태이거나 사용자 정보가 없는 경우
  if (!hasTokens || !user) {
    return (
      <PageHeader
        title="고객님, 향긋한 하루 보내세요!"
        variant="greeting"
        showBackButton={true}
      />
    );
  }

  // 로그인된 사용자의 경우
  const userName = user.name || "고객";

  return (
    <PageHeader
      title={`${userName}님, 향긋한 하루 보내세요!`}
      variant="greeting"
      showBackButton={true}
    />
  );
}
