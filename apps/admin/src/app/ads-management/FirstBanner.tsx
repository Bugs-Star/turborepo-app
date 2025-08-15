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
    name: "새로운 시즌 음료, 지금 만나 보세요!",
    image: "/coffee.jpg",
  },
  { id: "2", name: "새로 출시! 스트로베리 아사이", image: "/acai.jpg" },
];

const FirstBanner = () => {
  const [adsItem, setAdsItem] = useState(initialAdsItem);

  const handleDelete = (id: string) => {
    setAdsItem((prev) => prev.filter((item) => item.id !== id));
  };
  return (
    <div className="max-w-5xl mx-auto mt-5 bg-white p-6 rounded-lg">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold">첫 번째 배너 광고 등장 순서</h1>
      </div>

      <DraggableList
        items={adsItem}
        onReorder={setAdsItem}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default FirstBanner;
