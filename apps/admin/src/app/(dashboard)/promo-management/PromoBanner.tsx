"use client";

import { useEffect, useMemo, useState } from "react";
import DraggableList from "@/components/DraggableList";
import { useGetAllPromo } from "@/hooks/promo/useGetAllPromo";
import EditPromo from "./EditPromo";
import { useDeletePromo } from "@/hooks/promo/useDeletePromo";
import { useReorderPromos } from "@/hooks/promo/useReorderPromos";
import { ArrowUpDown, Loader2 } from "lucide-react";

interface AdsItem {
  id: string;
  name: string;
  image: string; // URL
}

const PromoBanner = () => {
  const { data, isLoading, isError, refetch } = useGetAllPromo({
    isActive: true,
  });

  console.log("프로모", data);
  const { mutate: deletePromo } = useDeletePromo();

  const { mutate: commitOrder, isPending } = useReorderPromos();

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
    setAdsItem((prev) => {
      const sameLength = prev.length === fetchedAds.length;
      const sameOrderAndFields =
        sameLength &&
        prev.every((it, i) => {
          const f = fetchedAds[i];
          return (
            f && it.id === f.id && it.name === f.name && it.image === f.image
          );
        });
      return sameOrderAndFields ? prev : fetchedAds;
    });
  }, [fetchedAds]);

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  // 드래그 직후: 전체 순서로 재구성 (이미 구현되어 있던 그대로 OK)
  const handleReorderLocal = (updatedList: { id: string }[]) => {
    setAdsItem((prev) => {
      const map = new Map(prev.map((it) => [it.id, it]));
      const next = updatedList.map((u) => map.get(u.id)!).filter(Boolean);
      return next.length === prev.length ? next : prev;
    });
  };

  // ✅ 드래그 완료: "전체 인덱스"를 updates로 만들어 커밋
  const handleReorderCommit = ({
    oldItems,
    newItems,
  }: {
    oldItems: { id: string }[];
    newItems: { id: string }[];
    moves: { id: string; from: number; to: number }[];
  }) => {
    if (!newItems.length) return;

    // 전체를 0..n-1로 부여
    const updates = newItems.map((it, idx) => ({ id: it.id, order: idx }));

    commitOrder(updates, {
      onSuccess: () => {
        // 서버 배치 성공 전/후 깜빡임 방지용: 로컬에도 즉시 주입
        setAdsItem((prev) => prev.map((it) => ({ ...it })));
      },
      onError: () => {
        // 롤백: oldItems 순서로 복원
        const order = new Map(oldItems.map((it, i) => [it.id, i]));
        setAdsItem((prev) =>
          [...prev].sort(
            (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
          )
        );
        alert("순서 저장에 실패했어요. 다시 시도해주세요.");
      },
    });
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
        <div className="max-w-5xl mx-auto mt-5 bg-card text-card-foreground p-6 rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-bold">배너 광고 등장 순서</h1>
          </div>
          <div className="text-sm text-muted-foreground">불러오는 중...</div>
        </div>
      )}

      {isError && (
        <div className="max-w-5xl mx-auto mt-5 bg-card text-card-foreground p-6 rounded-lg">
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
        <div className="max-w-5xl mx-auto mt-5 bg-card text-card-foreground p-6 rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-bold">배너 광고 등장 순서</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            표시할 상단 배너 프로모션이 없습니다.
          </p>
        </div>
      )}

      {!isLoading && !isError && adsItem.length > 0 && (
        <div className="max-w-5xl mx-auto mt-5 bg-card text-card-foreground p-6 rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-bold">배너 광고 등장 순서</h1>
            <div className="flex items-center gap-2 text-gray-700 min-h-5">
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs text-muted-foreground">
                    저장중..
                  </span>
                </>
              ) : (
                <>
                  <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                  재정렬
                </>
              )}
            </div>
          </div>

          <DraggableList
            items={adsItem}
            onEdit={handleEdit}
            onReorder={handleReorderLocal} // ✅ 전체 순서로 재구성
            onReorderCommit={handleReorderCommit} // ✅ 드롭 완료 → 서버 커밋
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
