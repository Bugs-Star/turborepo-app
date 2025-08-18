"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { BottomNavigation } from "@/components/layout";
import { PageHeader, EventDetailContent, AsyncWrapper } from "@/components";
import { useEventDetailFetch } from "@/hooks";

interface EventDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { data: event, isLoading, error } = useEventDetailFetch(id);

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* Header - 로딩 중에도 표시 */}
      <PageHeader
        title={event?.title || "이벤트"}
        showBackButton={true}
        onBackClick={() => router.back()}
      />

      {/* Main Content */}
      <AsyncWrapper loading={isLoading} error={error?.message || null}>
        <EventDetailContent event={event!} />
      </AsyncWrapper>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
