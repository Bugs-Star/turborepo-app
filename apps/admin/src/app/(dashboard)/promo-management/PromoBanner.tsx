"use client";

import { useEffect, useMemo, useState } from "react";
import DraggableList from "@/components/DraggableList";
import { useGetAllPromo } from "@/hooks/promo/useGetAllPromo";
import EditPromo from "./EditPromo";
import { useDeletePromo } from "@/hooks/promo/useDeletePromo";

interface AdsItem {
  id: string;
  name: string;
  image: string; // URL
}

const PromoBanner = () => {
  const { data, isLoading, isError, refetch } = useGetAllPromo({
    isActive: true,
  });
  const { mutate: deletePromo } = useDeletePromo();

  const fetched = data?.promotions ?? [];

  const fetchedAds: AdsItem[] = useMemo(() => {
    return fetched.map((p) => ({
      id: p._id,
      name: p.title,
      image: p.promotionImg,
    }));
  }, [fetched]);

  const [adsItem, setAdsItem] = useState<AdsItem[]>([]);
  useEffect(() => {
    setAdsItem(fetchedAds);
  }, [fetchedAds]);

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleDelete = (id: string) => {
    const ok = window.confirm("이 프로모션을 삭제하시겠습니까?");
    if (!ok) return;

    deletePromo(id, {
      onSuccess: () => {
        // 로컬 상태에서도 제거 (UX 빠르게 반응)
        setAdsItem((prev) => prev.filter((item) => item.id !== id));
      },
    });
  };

  const selected = useMemo(
    () => fetched.find((p) => p._id === editingId),
    [fetched, editingId]
  );

  return (
    <>
      {isLoading && (
        <div className="max-w-5xl mx-auto mt-5 bg-white p-6 rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-bold">배너 광고 등장 순서</h1>
          </div>
          <div className="text-sm text-gray-500">불러오는 중...</div>
        </div>
      )}

      {isError && (
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
      )}

      {!isLoading && !isError && adsItem.length === 0 && (
        <div className="max-w-5xl mx-auto mt-5 bg-white p-6 rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-bold">배너 광고 등장 순서</h1>
          </div>
          <p className="text-sm text-gray-500">
            표시할 상단 배너 프로모션이 없습니다.
          </p>
        </div>
      )}

      {!isLoading && !isError && adsItem.length > 0 && (
        <div className="max-w-5xl mx-auto mt-5 bg-white p-6 rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-bold">배너 광고 등장 순서</h1>
          </div>

          <DraggableList
            items={adsItem}
            onReorder={setAdsItem}
            onEdit={handleEdit}
            onDelete={handleDelete} // ✅ 서버 연동된 삭제
          />
        </div>
      )}

      {editingId && selected && (
        <EditPromo
          promotionId={editingId}
          initialData={{
            title: selected.title,
            description: selected.description,
            promotionImgUrl: selected.promotionImg,
            startDate: selected.startDate,
            endDate: selected.endDate,
          }}
          onClose={() => setEditingId(null)}
        />
      )}
    </>
  );
};

export default PromoBanner;
