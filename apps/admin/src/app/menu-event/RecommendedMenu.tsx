"use client";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import DraggableList from "@/components/DraggableList";

interface EventItem {
  id: string;
  name: string;
  image: string;
}

const initialMenus: EventItem[] = [
  { id: "1", name: "프리미엄 블렌드 커피", image: "/coffee.jpg" },
  { id: "2", name: "스트로베리 아사이", image: "/acai.jpg" },
  { id: "3", name: "레드벨벳", image: "/redvelvet.png" },
  { id: "4", name: "말차 라떼", image: "/matcha.jpg" },
];

const RecommendMenu = () => {
  const [menus, setMenus] = useState(initialMenus);

  const handleDelete = (id: string) => {
    setMenus((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto mt-5 bg-white p-6 rounded-lg">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold">추천 메뉴 재정렬</h1>
        <div className="flex items-center gap-2">
          <ArrowUpDown /> 재정렬
        </div>
      </div>

      {/* Draggable list */}
      <DraggableList
        items={menus}
        onReorder={setMenus}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default RecommendMenu;
