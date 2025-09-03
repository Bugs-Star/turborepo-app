"use client";

import { useEffect, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import DraggableList from "@/components/DraggableList";
import { useGetAllRecommendedMenu } from "@/hooks/event/useGetAllRecommendedMenu";

interface EventItem {
  id: string;
  name: string;
  image: string;
}

const RecommendMenu = () => {
  // ✅ 추천 메뉴만 불러오기
  const { data, isLoading, isError } = useGetAllRecommendedMenu(1, 50);
  const [menus, setMenus] = useState<EventItem[]>([]);

  // API 결과 → DraggableList 아이템으로 매핑
  useEffect(() => {
    if (!data?.products) return;
    const mapped: EventItem[] = data.products.map((p) => ({
      id: p._id,
      name: p.productName,
      image: p.productImg, // 서버가 주는 url/base64
    }));
    setMenus(mapped);
  }, [data]);

  const handleDelete = (id: string) => {
    // 지금은 UI상 삭제만; 실제 삭제 API 연결 원하면 말해줘!
    setMenus((prev) => prev.filter((item) => item.id !== id));
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto mt-5 bg-white p-6 rounded-lg">
        <div className="text-center text-gray-600">불러오는 중…</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-5xl mx-auto mt-5 bg-white p-6 rounded-lg">
        <div className="text-center text-red-500">추천 메뉴 로딩 실패</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-5 bg-white p-6 rounded-lg">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold">추천 메뉴 재정렬</h1>
        <div className="flex items-center gap-2 text-gray-700">
          <ArrowUpDown className="w-4 h-4" /> 재정렬
        </div>
      </div>

      {/* Draggable list */}
      <DraggableList
        items={menus}
        onReorder={setMenus} // 드래그 후 UI상 순서만 우선 반영
        onDelete={handleDelete} // UI 삭제
      />
    </div>
  );
};

export default RecommendMenu;
