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

    sort: (a, b) => {
      const ao = a.eventOrder ?? Number.MAX_SAFE_INTEGER; // order 없으면 맨 뒤
      const bo = b.eventOrder ?? Number.MAX_SAFE_INTEGER;
      return ao - bo;
    },

    // 서버 저장(배치)
    persist: (updates: ReorderUpdate[]) =>
      EventsService.updateEventOrdersBatch(
        updates.map((u) => ({ id: u.id, eventOrder: u.order }))
      ),
  });
};
