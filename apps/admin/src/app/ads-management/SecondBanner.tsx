"use client";

import DraggableList from "@/components/DraggableList";
import { useState } from "react";

interface AdsItem {
  id: string;
  name: string;
  image: string;
}

const initialAdsItem: AdsItem[] = [
  {
    id: "1",
    name: "썸머 프로모션 지금 참가해 보세요!",
    image: "/redvelvet.png",
  },
  { id: "2", name: "새로 출시! 마차라떼", image: "/matcha.jpg" },
];

const SecondBanner = () => {
  const [adsItem, setAdsItem] = useState(initialAdsItem);

  const handleDelete = (id: string) => {
    setAdsItem((prev) => prev.filter((item) => item.id !== id));
  };
  return (
    <div className="max-w-5xl mx-auto mt-5 bg-white p-6 rounded-lg">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold">두 번째 배너 광고 등장 순서</h1>
      </div>

      <DraggableList
        items={adsItem}
        onReorder={setAdsItem}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default SecondBanner;
