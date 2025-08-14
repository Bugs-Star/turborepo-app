"use client";

import { useProfileFetch } from "@/hooks/useProfileFetch";
import { PageHeader } from "@/components/ui";
import { tokenManager } from "@/lib/api";

export default function GreetingSection() {
  const { user, loading } = useProfileFetch();
  const hasTokens = tokenManager.hasTokens();

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
