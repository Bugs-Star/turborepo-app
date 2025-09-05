"use client";

import { EventsService } from "@/lib/api/events";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteEvent = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => EventsService.deleteEvent(eventId),
    // 서버 성공 후 목록 최신화
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
