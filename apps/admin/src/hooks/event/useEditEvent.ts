// hooks/event/useEditEvent.ts
"use client";

import {
  EventsService,
  EventItem,
  type EditEventRequest,
} from "@/lib/api/events";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useEditEvent = (eventId: string) => {
  const qc = useQueryClient();

  return useMutation<EventItem, unknown, EditEventRequest>({
    mutationFn: (payload) => EventsService.editEvent(eventId, payload),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["events"] });

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
