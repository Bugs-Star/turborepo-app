"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { Event } from "@/lib/services";
import { SectionAsyncWrapper, EventSectionSkeleton } from "@/components/ui";

const ITEMS_PER_PAGE = 5;

interface EventSectionProps {
  events: Event[];
  loading?: boolean;
  onEventClick?: (event: Event) => void;
}

export default React.memo(function EventSection({
  events,
  loading = false,
  onEventClick,
}: EventSectionProps) {
  const [displayCount, setDisplayCount] = useState(5);

  // 현재 표시할 이벤트들
  const displayedEvents = React.useMemo(
    () => events.slice(0, displayCount),
    [events, displayCount]
  );

  // 더보기 버튼 표시 여부
  const hasMoreEvents = React.useMemo(
    () => displayCount < events.length,
    [displayCount, events.length]
  );

  // 더보기 버튼 클릭 핸들러
  const handleLoadMore = useCallback(() => {
    setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
  }, []);

  const renderEventList = useCallback(
    () => (
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {displayedEvents.map((event) => (
          <div
            key={event._id}
            className="flex-shrink-0 w-64 cursor-pointer"
            onClick={() => onEventClick?.(event)}
          >
            {/* 이미지 카드 */}
            <div className="w-64 h-40 rounded-lg overflow-hidden mb-3 shadow-sm hover:shadow-md transition-shadow">
              <Image
                src={event.eventImg}
                alt={event.title}
                width={256}
                height={160}
                className="w-full h-full object-cover"
                sizes="(max-width: 768px) 256px, 256px"
                priority={false}
                loading="lazy"
              />
            </div>
            {/* 텍스트 영역 */}
            <div className="px-1">
              <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1 overflow-hidden text-ellipsis">
                {event.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 overflow-hidden text-ellipsis">
                {event.description}
              </p>
            </div>
          </div>
        ))}

        {/* 더보기 버튼 - 스크롤 영역 안에 배치 */}
        {hasMoreEvents && (
          <div className="flex-shrink-0 flex items-start justify-center pt-16">
            <button
              onClick={handleLoadMore}
              className="text-sm text-gray-600 hover:text-green-800 hover:font-medium cursor-pointer transition-colors"
            >
              더 보기
            </button>
          </div>
        )}
      </div>
    ),
    [displayedEvents, onEventClick, hasMoreEvents, handleLoadMore]
  );

  return (
    <SectionAsyncWrapper
      loading={loading}
      error={null}
      title="새로운 소식"
      subtitle="놓치기 아까운 혜택과 이야기를 전해드려요!"
      loadingMessage="이벤트를 불러오는 중..."
      errorMessage="이벤트를 불러올 수 없습니다."
      skeleton={<EventSectionSkeleton count={5} />}
    >
      <div className="space-y-4">{renderEventList()}</div>
    </SectionAsyncWrapper>
  );
});
