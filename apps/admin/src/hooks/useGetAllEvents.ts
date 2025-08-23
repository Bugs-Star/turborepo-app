"use client";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import {
  EventsService,
  GetEventsParams,
  GetEventsResponse,
} from "@/lib/events";

export const useGetAllEvents = (params?: GetEventsParams) => {
  const options: UseQueryOptions<GetEventsResponse, Error> = {
    queryKey: ["events", params],
    queryFn: () => EventsService.getAll(params),
    staleTime: 1000 * 60 * 5, // 5분 캐시 유지
  };

  return useQuery(options);
};
