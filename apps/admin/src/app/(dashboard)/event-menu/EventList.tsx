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

  // 1) 서버 정렬값으로 정렬해 로컬 반영
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
    const prev = events;
    setEvents((p) => p.filter((it) => it._id !== id));

    deleteEvent(id, {
      onSuccess: () => notify?.success?.("이벤트가 삭제되었습니다."),
      onError: () => {
        setEvents(prev);
        notify?.error?.("삭제에 실패했어요. 다시 시도해주세요.");
      },
    });
  };

  // 2) 드래그 직후: 전체 순서로 재구성
  const handleReorderLocal = (updatedList: { id: string }[]) => {
    setEvents((prev) => {
      if (updatedList.length === prev.length) {
        const map = new Map(prev.map((it) => [it._id, it]));
        return updatedList.map((u) => map.get(u.id)!).filter(Boolean);
      }
      const order = new Map(updatedList.map((u, i) => [u.id, i]));
      return [...prev].sort((a, b) => {
        const ao = order.has(a._id)
          ? order.get(a._id)!
          : Number.MAX_SAFE_INTEGER;
        const bo = order.has(b._id)
          ? order.get(b._id)!
          : Number.MAX_SAFE_INTEGER;
        return ao - bo;
      });
    });
  };

  // 3) 커밋: 0..n-1 전송 + 성공 시 로컬 eventOrder 주입
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
        setEvents((prev) =>
          prev.map((it, idx) => ({ ...it, eventOrder: idx }))
        );
      },
      onError: () => {
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

  // 상태 뷰 (토큰 적용)
  if (isLoading)
    return (
      <div className="text-center mt-5 text-muted-foreground">로딩 중...</div>
    );
  if (isError)
    return (
      <div className="text-center mt-5 text-danger">데이터 불러오기 실패</div>
    );

  return (
    <div className="max-w-5xl mx-auto mt-5 bg-card text-card-foreground border border-border p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">이벤트 목록</h1>
        <div className="flex items-center gap-2 min-h-5">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs text-muted-foreground">저장중..</span>
            </>
          ) : (
            <>
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">재정렬</span>
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
          <span className="text-muted-foreground text-sm">
            {item.description}
          </span>
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
