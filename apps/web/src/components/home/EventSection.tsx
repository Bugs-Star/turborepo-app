"use client";

import Image from "next/image";
import { Event } from "@/lib/services";
import { SectionAsyncWrapper, EventSectionSkeleton } from "@/components/ui";

interface EventSectionProps {
  events: Event[];
  loading?: boolean;
  onEventClick?: (event: Event) => void;
}

export default function EventSection({
  events,
  loading = false,
  onEventClick,
}: EventSectionProps) {
  const renderEventList = () => (
    <div className="flex flex-col gap-4">
      {events.map((event) => (
        <div
          key={event._id}
          className="flex gap-4 bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onEventClick?.(event)}
        >
          <div className="flex-shrink-0">
            <Image
              src={event.eventImg}
              alt={event.title}
              width={64}
              height={64}
              className="w-16 h-16 rounded-lg object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 mb-1">
              {event.title}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-1 overflow-hidden text-ellipsis">
              {event.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <SectionAsyncWrapper
      loading={loading}
      error={null}
      title="새로운 소식"
      loadingMessage="이벤트를 불러오는 중..."
      errorMessage="이벤트를 불러올 수 없습니다."
      skeleton={<EventSectionSkeleton count={3} />}
    >
      {renderEventList()}
    </SectionAsyncWrapper>
  );
}
