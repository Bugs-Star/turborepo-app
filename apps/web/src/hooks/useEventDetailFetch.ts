import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/lib/services";

export const useEventDetailFetch = (id: string) => {
  return useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const response = await eventService.getEvent(id);
      return response.event;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};
