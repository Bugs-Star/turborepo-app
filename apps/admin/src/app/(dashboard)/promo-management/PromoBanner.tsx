"use client";

import { useEffect, useMemo, useState } from "react";
import DraggableList from "@/components/DraggableList";
import { useGetAllPromo } from "@/hooks/promo/useGetAllPromo";

interface AdsItem {
  id: string;
  name: string;
  image: string; // URL 또는 data URL
}

const PromoBanner = () => {
  // 서버 필터 사용: 상단(up) + 활성(true)
  const { data, isLoading, isError, refetch } = useGetAllPromo({
    isActive: true,
  });

  // 응답을 UI용 아이템으로 매핑
  const fetchedAds: AdsItem[] = useMemo(() => {
    const list = data?.promotions ?? [];
    return list.map((p) => ({
      id: p._id,
      name: p.title,
      image: p.promotionImg,
    }));
  }, [data]);

  // 드래그/삭제를 위한 로컬 상태
  const [adsItem, setAdsItem] = useState<AdsItem[]>([]);
  useEffect(() => {
    setAdsItem(fetchedAds);
  }, [fetchedAds]);

  const handleDelete = (id: string) => {
    setAdsItem((prev) => prev.filter((item) => item.id !== id));
    // TODO: 서버 삭제 연동 시 여기서 delete API 호출 후 refetch()
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto mt-5 bg-white p-6 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold">배너 광고 등장 순서</h1>
        </div>
        <div className="text-sm text-gray-500">불러오는 중...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-5xl mx-auto mt-5 bg-white p-6 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold">배너 광고 등장 순서</h1>
          <button
            onClick={() => refetch()}
            className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
          >
            다시 시도
          </button>
        </div>
        <div className="text-sm text-red-600">
          프로모션을 불러오지 못했습니다.
        </div>
      </div>
    );
  }

  if (adsItem.length === 0) {
    return (
      <div className="max-w-5xl mx-auto mt-5 bg-white p-6 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold">배너 광고 등장 순서</h1>
        </div>
        <p className="text-sm text-gray-500">
          표시할 상단 배너 프로모션이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-5 bg-white p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold">배너 광고 등장 순서</h1>
      </div>

      <DraggableList
        items={adsItem}
        onReorder={setAdsItem}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default PromoBanner;
