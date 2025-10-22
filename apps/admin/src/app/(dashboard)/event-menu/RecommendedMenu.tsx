// app/.../RecommendMenu.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Loader2 } from "lucide-react";
import DraggableList from "@/components/DraggableList";
import { useGetAllRecommendedMenu } from "@/hooks/event/useGetAllRecommendedMenu";
import { useReorderRecommended } from "@/hooks/event/useReorderRecommended";

type MenuItem = {
  id: string;
  name: string;
  image: string;
  /** 로컬 표시용 정렬 인덱스(선택) */
  localOrder?: number;
};

const LS_KEY = "recommendMenu.reorderEnabled";

const RecommendMenu = () => {
  const { data, isLoading, isError } = useGetAllRecommendedMenu(1, 50);

  // ⛳️ 토글 상태 (localStorage 유지)
  const [reorderEnabled, setReorderEnabled] = useState<boolean>(false);
  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    if (saved != null) setReorderEnabled(saved === "1");
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_KEY, reorderEnabled ? "1" : "0");
    }
  }, [reorderEnabled]);

  // 서버 데이터 → 초기 표시 순서 보장 (recommendedOrder ASC, tie: _id)
  const initialMenus = useMemo<MenuItem[]>(() => {
    if (!data?.products) return [];
    return [...data.products]
      .sort((a, b) => {
        const ao =
          typeof a.recommendedOrder === "number"
            ? a.recommendedOrder
            : Number.MAX_SAFE_INTEGER;
        const bo =
          typeof b.recommendedOrder === "number"
            ? b.recommendedOrder
            : Number.MAX_SAFE_INTEGER;
        if (ao !== bo) return ao - bo;
        return a._id.localeCompare(b._id);
      })
      .map((p) => ({
        id: p._id,
        name: p.productName,
        image: p.productImg,
      }));
  }, [data]);

  const [menus, setMenus] = useState<MenuItem[]>(initialMenus);
  useEffect(() => setMenus(initialMenus), [initialMenus]);

  const { mutate: commitOrder, isPending } = useReorderRecommended();

  const handleDelete = (id: string) => {
    setMenus((prev) => prev.filter((item) => item.id !== id));
  };

  // 드래그 직후: updatedList(전체 id 순서)로 완전 재구성
  const handleReorderLocal = (updatedList: { id: string }[]) => {
    setMenus((prev) => {
      const map = new Map(prev.map((it) => [it.id, it]));
      const next = updatedList.map((u) => map.get(u.id)!).filter(Boolean);
      // 방어: 일부만 들어온 경우 이전 상태 유지
      return next.length === prev.length ? next : prev;
    });
  };

  // 드래그 완료: 전체 인덱스로 서버 저장 (+ 실패 시 롤백)
  const handleReorderCommit = ({
    oldItems,
    newItems,
  }: {
    oldItems: { id: string }[];
    newItems: { id: string }[];
    // moves는 사용하지 않으면 제거하거나 앞에 _ 붙여 ESLint 경고 방지
    // moves: { id: string; from: number; to: number }[];
  }) => {
    if (!newItems.length) return;

    // ✅ 서버 스펙: 전체 순서의 ID 배열 필요
    const ids = newItems.map((it) => it.id);

    commitOrder(ids, {
      onSuccess: () => {
        // ⬇️ any 대신 명시적 선택 필드(localOrder) 갱신
        setMenus((prev) => prev.map((it, idx) => ({ ...it, localOrder: idx })));
      },
      onError: () => {
        const pos = new Map(oldItems.map((it, i) => [it.id, i]));
        setMenus((prev) =>
          [...prev].sort((a, b) => (pos.get(a.id) ?? 0) - (pos.get(b.id) ?? 0))
        );
        alert("추천 순서 저장에 실패했어요. 다시 시도해주세요.");
      },
    });
  };

  // 🔕 OFF일 때: 전체 기능 숨기고 안내만
  if (!reorderEnabled) {
    return (
      <div className="max-w-5xl mx-auto mt-5 bg-background p-6 rounded-lg border border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">추천 메뉴</h1>
          {/* 토글 스위치 */}
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none text-muted-foreground">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={reorderEnabled}
              onChange={(e) => setReorderEnabled(e.target.checked)}
            />
            <span className="w-10 h-6 rounded-full bg-muted-foreground relative peer-checked:bg-primary transition-colors">
              <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-all peer-checked:left-4" />
            </span>
            활성화
          </label>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          정렬 기능이 비활성화되어 있습니다. 활성화를 위해 우측 상단 토글을
          켜주세요.
        </p>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="text-center mt-5 text-muted-foreground">로딩 중...</div>
    );
  }

  if (isError) {
    return (
      <div className="text-center mt-5 text-muted-foreground">
        추천 메뉴 로딩 실패
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-5 bg-background p-6 rounded-lg">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="flex">
          {" "}
          <h1 className="text-lg font-bold">추천 메뉴 재정렬</h1>
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none text-muted-foreground ml-5 ">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={reorderEnabled}
              onChange={(e) => setReorderEnabled(e.target.checked)}
            />
            <span className="w-10 h-6 rounded-full bg-muted-foreground relative peer-checked:bg-primary transition-colors">
              <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-all peer-checked:left-4 " />
            </span>
            비활성화
          </label>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground min-h-5">
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">저장중..</span>
            </>
          ) : (
            <>
              <ArrowUpDown className="w-4 h-4" />
              재정렬
            </>
          )}
        </div>
      </div>

      {/* 드래그 리스트 */}
      <DraggableList
        items={menus}
        onReorder={handleReorderLocal}
        onReorderCommit={handleReorderCommit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default RecommendMenu;
