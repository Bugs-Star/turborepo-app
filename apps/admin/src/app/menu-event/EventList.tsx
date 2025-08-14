"use client";

import DraggableList from "@/components/DraggableList";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";

interface EventItem {
  id: string;
  name: string;
  image: string;
  description: string;
  startAt: string;
  finishAt: string;
}

const initialEvents: EventItem[] = [
  {
    id: "1",
    name: "새로운 여름 음료 출시!",
    description: "상큼한 베리 스무디와 달콤한 복숭아 티를 만나보세요.",
    startAt: "01-01-2026",
    finishAt: "31-01-2026",
    image: "/acai.jpg",
  },
  {
    id: "2",
    name: "크리스마스 시즌 이벤트",
    description: "따뜻한 크리스마스 라떼와 진저 쿠키 증정!",
    startAt: "15-12-2025",
    finishAt: "25-12-2025",
    image: "/redvelvet.png",
  },
  {
    id: "3",
    name: "겨울 한정 메뉴 출시",
    description: "달콤한 마시멜로 핫초코를 즐겨보세요.",
    startAt: "01-12-2025",
    finishAt: "31-12-2025",
    image: "/coffee.jpg",
  },
  {
    id: "4",
    name: "여름 빙수 페스티벌",
    description: "다양한 과일 빙수를 시원하게 즐기세요.",
    startAt: "01-07-2026",
    finishAt: "31-07-2026",
    image: "/matcha.jpg",
  },
  {
    id: "5",
    name: "신규 멤버십 가입 이벤트",
    description: "가입 즉시 20% 할인 쿠폰 증정!",
    startAt: "01-02-2026",
    finishAt: "15-02-2026",
    image: "/coffee.jpg",
  },
];

const EventList = () => {
  const [event, setEvent] = useState(initialEvents);

  const handleDelete = (id: string) => {
    setEvent((prev) => prev.filter((item) => item.id !== id));
  };

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
      <DraggableList<EventItem>
        items={event}
        onReorder={setEvent}
        onDelete={handleDelete}
        renderExtra={(item) => (
          <>
            <span className="text-gray-600 text-sm">{item.description}</span>
          </>
        )}
      />
    </div>
  );
};

export default EventList;
