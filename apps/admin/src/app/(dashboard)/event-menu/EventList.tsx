"use client";

import DraggableList from "@/components/DraggableList";
import { useGetAllEvents } from "@/hooks/useGetAllEvents";
import { ArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { EventItem } from "@/lib/events";

const EventList = () => {
  const { data, isLoading, isError } = useGetAllEvents();
  const [events, setEvents] = useState<EventItem[]>([]);

  // API 데이터 업데이트
  useEffect(() => {
    if (data?.events) {
      setEvents(data.events);
    }
  }, [data]);

  const handleDelete = (id: string) => {
    setEvents((prev) => prev.filter((item) => item._id !== id));
  };

  if (isLoading) return <div className="text-center mt-5">로딩 중...</div>;
  if (isError)
    return (
      <div className="text-center mt-5 text-red-500">데이터 불러오기 실패</div>
    );

  return (
    <div className="max-w-5xl mx-auto mt-5 bg-white p-6 rounded-lg">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold">이벤트 목록</h1>
        <div className="flex items-center gap-2">
          <ArrowUpDown /> 재정렬
        </div>
      </div>

      {/* Draggable list */}
      <DraggableList
        items={events.map((event) => ({
          id: event._id,
          name: event.title,
          image: event.eventImg,
          ...event,
          startDate: event.startDate,
          endDate: event.endDate,
        }))}
        onReorder={(updatedList) =>
          setEvents(
            updatedList.map((item) => ({
              ...item,
              _id: item.id,
            }))
          )
        }
        onDelete={handleDelete}
        renderExtra={(item) => (
          <span className="text-gray-600 text-sm">{item.description}</span>
        )}
      />
    </div>
  );
};

export default EventList;
