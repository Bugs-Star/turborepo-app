import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/lib/services";

export const useEventFetch = (params?: {
  isActive?: boolean;
  current?: boolean;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["events", params],
    queryFn: async () => {
      const response = await eventService.getEvents(params);
      return response.events;
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};
