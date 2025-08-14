"use client";

import { useProfileFetch } from "@/hooks/useProfileFetch";

export default function GreetingSection() {
  const { user, loading } = useProfileFetch();

  if (loading) {
    return (
      <div className="px-6 py-4 text-center border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mx-auto"></div>
      </div>
    );
  }

  const userName = user?.name || "고객";

  return (
    <div className="px-6 py-4 text-center border-b border-gray-200">
      <h1 className="text-lg font-medium text-gray-900">
        {userName}님, 향긋한 하루 보내세요!
      </h1>
    </div>
  );
}
