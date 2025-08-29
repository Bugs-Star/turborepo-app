"use client";

import Image from "next/image";
import { Event } from "@/lib/services";

interface EventSectionProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
}

export default function EventSection({
  events,
  onEventClick,
}: EventSectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-2">새로운 소식</h2>
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
    </div>
  );
}
