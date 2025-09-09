// hooks/event/useReorderEvents.ts
"use client";

import { EventsService, GetEventsResponse, EventItem } from "@/lib/api/events";
import { useReorderList, ReorderUpdate } from "../useReorderList";

export const useReorderEvents = () => {
  return useReorderList<GetEventsResponse, EventItem>({
    queryKeyRoot: "events",
    getList: (d) => d.events,
    setList: (d, next) => ({ ...d, events: next }),
    getId: (e) => e._id,
    setOrder: (e, order) => ({ ...e, eventOrder: order }),

    // eventOrder ASC, tie는 _id 고정
    sort: (a, b) => {
      const ao =
        typeof a.eventOrder === "number"
          ? a.eventOrder
          : Number.MAX_SAFE_INTEGER;
      const bo =
        typeof b.eventOrder === "number"
          ? b.eventOrder
          : Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return a._id.localeCompare(b._id);
    },

    /** ✅ 변경: updates → id 배열로 변환하여 배치 엔드포인트 호출 */
    persist: async (updates: ReorderUpdate[]) => {
      const normalized = [...updates]
        .sort((a, b) => a.order - b.order)
        .map((u, idx) => ({ id: u.id, order: idx })); // 안전하게 0..n-1 재부여
      await EventsService.reorderEvents(normalized);
    },
  });
};
