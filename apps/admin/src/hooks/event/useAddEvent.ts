// hooks/event/useAddEvent.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  EventsService,
  type AddEventPayload,
  type EventItem,
  type GetEventsResponse,
} from "@/lib/api/events";

export const useAddEvent = () => {
  const qc = useQueryClient();

  return useMutation<EventItem, unknown, AddEventPayload>({
    mutationFn: (payload) => EventsService.addEvent(payload),

    onSuccess: (created) => {
      // 1) 현재 로딩된 모든 ["events"] 캐시에 즉시 끼워넣기
      const entries = qc.getQueriesData<GetEventsResponse>({
        queryKey: ["events"],
      });

      for (const [key, data] of entries) {
        if (!data) continue;

        // 페이지네이션을 유지하면서 첫 페이지 맨 앞에 삽입
        qc.setQueryData<GetEventsResponse>(key, {
          ...data,
          events: [created, ...data.events],
          pagination: {
            ...data.pagination,
            totalItems: data.pagination.totalItems + 1,
          },
        });
      }

      // 2) 백업: 서버 기준 최신화
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
