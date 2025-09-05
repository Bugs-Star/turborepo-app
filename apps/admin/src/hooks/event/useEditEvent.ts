"use client";

import { EventsService, EventItem } from "@/lib/api/events";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type EditEventPayload = Partial<
  Pick<
    EventItem,
    | "title"
    | "description"
    | "eventImg"
    | "startDate"
    | "endDate"
    | "isActive"
    | "eventOrder"
  >
>;

export const useEditEvent = (eventId: string) => {
  const qc = useQueryClient();

  return useMutation<EventItem, unknown, EditEventPayload>({
    mutationFn: (payload) => EventsService.editEvent(eventId, payload),
    onSuccess: (updated) => {
      // 목록 캐시 최신화
      qc.invalidateQueries({ queryKey: ["events"] });

      // 낙관적 UX: 캐시 내 단건도 즉시 갱신
      const entries = qc.getQueriesData<{ events: EventItem[] }>({
        queryKey: ["events"],
      });
      for (const [key, data] of entries) {
        if (!data) continue;
        qc.setQueryData(key, {
          ...data,
          events: data.events.map((e) => (e._id === updated._id ? updated : e)),
        });
      }
    },
  });
};
