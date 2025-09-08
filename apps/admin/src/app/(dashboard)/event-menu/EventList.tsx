"use client";

import DraggableList from "@/components/DraggableList";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EventItem } from "@/lib/api/events";
import { useGetAllEvents } from "@/hooks/event/useGetAllEvents";
import { useReorderEvents } from "@/hooks/event/useReorderEvents";
import EditEvent from "./EditEvent";
import { useDeleteEvent } from "@/hooks/event/useDeleteEvent";
import { notify } from "@/lib/notify";

const byOrder = (a: EventItem, b: EventItem) => {
  const ao =
    typeof a.eventOrder === "number" ? a.eventOrder : Number.MAX_SAFE_INTEGER;
  const bo =
    typeof b.eventOrder === "number" ? b.eventOrder : Number.MAX_SAFE_INTEGER;
  if (ao !== bo) return ao - bo;
  // tie-breaker를 고정값으로(불변키) → 날짜는 피함
  return a._id.localeCompare(b._id);
};

const EventList = () => {
  const { data, isLoading, isError } = useGetAllEvents();
  const { mutate: commitOrder, isPending } = useReorderEvents();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  type EditEventInitial = React.ComponentProps<typeof EditEvent>["initialData"];
  const [initialData, setInitialData] = useState<EditEventInitial | null>(null);
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent();

  // 1) 서버 응답을 항상 eventOrder 기준으로 정렬해서 로컬에 반영
  const sortedFromServer = useMemo(
    () => (data?.events ? [...data.events].sort(byOrder) : []),
    [data]
  );
  const [events, setEvents] = useState<EventItem[]>(sortedFromServer);

  useEffect(() => {
    setEvents(sortedFromServer);
  }, [sortedFromServer]);

  const handleEdit = (id: string) => {
    const target = events.find((e) => e._id === id);
    if (!target) return;

    setEditingId(target._id);
    setInitialData({
      eventImgUrl: target.eventImg,
      title: target.title,
      description: target.description,
      startDate: target.startDate,
      endDate: target.endDate,
      isActive: target.isActive,
      eventOrder: target.eventOrder,
    });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("정말 삭제하시겠어요?")) return;

    // 현재 리스트를 캡처해 두어 실패 시 롤백
    const prev = events;
    // 낙관적 업데이트
    setEvents((p) => p.filter((it) => it._id !== id));

    deleteEvent(id, {
      onSuccess: () => {
        notify?.success?.("이벤트가 삭제되었습니다.");
      },
      onError: () => {
        setEvents(prev); // 롤백
        notify?.error?.("삭제에 실패했어요. 다시 시도해주세요.");
      },
    });
  };

  // 2) 드래그 직후: DraggableList가 넘겨준 "전체 순서"로 **완전히 재구성**
  const handleReorderLocal = (updatedList: { id: string }[]) => {
    setEvents((prev) => {
      // 보통 updatedList는 전체 길이와 동일해야 함(컴포넌트 구현에 따라 다르다면 보완)
      if (updatedList.length === prev.length) {
        const map = new Map(prev.map((it) => [it._id, it]));
        return updatedList.map((u) => map.get(u.id)!).filter(Boolean);
      }
      // 혹시 일부만 왔을 때의 안전장치(해당 id는 앞으로, 나머지는 기존 순서 유지)
      const order = new Map(updatedList.map((u, i) => [u.id, i]));
      return [...prev].sort((a, b) => {
        const ao = order.has(a._id)
          ? order.get(a._id)!
          : Number.MAX_SAFE_INTEGER;
        const bo = order.has(b._id)
          ? order.get(b._id)!
          : Number.MAX_SAFE_INTEGER;
        if (ao !== bo) return ao - bo;
        return 0;
      });
    });
  };

  // 3) 커밋: 전체를 0..n-1로 전송 + 성공 시 로컬 eventOrder도 즉시 주입
  const handleReorderCommit = ({
    oldItems,
    newItems,
  }: {
    oldItems: { id: string }[];
    newItems: { id: string }[];
    moves: { id: string; from: number; to: number }[];
  }) => {
    if (!newItems.length) return;

    const updates = newItems.map((it, idx) => ({ id: it.id, order: idx }));

    commitOrder(updates, {
      onSuccess: () => {
        // 현재 표시 순서대로 eventOrder를 로컬에도 즉시 심어둠(리패치 전 깜빡임/섞임 방지)
        setEvents((prev) =>
          prev.map((it, idx) => ({ ...it, eventOrder: idx }))
        );
      },
      onError: () => {
        // 롤백: oldItems 순서로 되돌리기
        const rollbackPos = new Map(oldItems.map((it, i) => [it.id, i]));
        setEvents((prev) =>
          [...prev].sort(
            (a, b) =>
              (rollbackPos.get(a._id) ?? 0) - (rollbackPos.get(b._id) ?? 0)
          )
        );
        alert("순서 저장에 실패했어요. 다시 시도해주세요.");
      },
    });
  };

  if (isLoading) return <div className="text-center mt-5">로딩 중...</div>;
  if (isError)
    return (
      <div className="text-center mt-5 text-red-500">데이터 불러오기 실패</div>
    );

  return (
    <div className="max-w-5xl mx-auto mt-5 bg-white p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold">이벤트 목록</h1>
        <div className="flex items-center gap-2 min-h-5">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs text-gray-500">저장중..</span>
            </>
          ) : (
            <>
              <ArrowUpDown /> 재정렬
            </>
          )}
        </div>
      </div>

      <DraggableList
        items={events.map((event) => ({
          id: event._id,
          name: event.title,
          image: event.eventImg,
          startDate: event.startDate,
          endDate: event.endDate,
          description: event.description,
        }))}
        onReorder={handleReorderLocal}
        onReorderCommit={handleReorderCommit}
        onEdit={handleEdit}
        onDelete={handleDelete}
        renderExtra={(item) => (
          <span className="text-gray-600 text-sm">{item.description}</span>
        )}
      />

      {open && editingId && (
        <EditEvent
          eventId={editingId}
          initialData={initialData ?? undefined}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default EventList;
