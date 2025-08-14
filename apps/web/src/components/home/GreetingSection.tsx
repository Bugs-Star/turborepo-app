"use client";

import { useProfileFetch } from "@/hooks/useProfileFetch";
import { PageHeader } from "@/components/ui";

export default function GreetingSection() {
  const { user, loading } = useProfileFetch();

  if (loading) {
    return (
      <PageHeader
        title="고객님, 향긋한 하루 보내세요!"
        variant="greeting"
        showBackButton={true}
        className="animate-pulse"
      />
    );
  }

  const userName = user?.name || "고객";

  return (
    <PageHeader
      title={`${userName}님, 향긋한 하루 보내세요!`}
      variant="greeting"
      showBackButton={true}
    />
  );
}
