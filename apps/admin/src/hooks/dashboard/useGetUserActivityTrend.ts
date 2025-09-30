"use client";

import { useQuery } from "@tanstack/react-query";
import {
  DashboardApi,
  type PeriodicalParams,
  type UserActivityPoint,
} from "@/lib/api/dashboard";

export function useGetUserActivityTrend(params: PeriodicalParams) {
  return useQuery<UserActivityPoint[]>({
    queryKey: [
      "user-activity-trend",
      params.periodType,
      params.year,
      params.month,
      params.week,
    ],
    queryFn: () => DashboardApi.getUserActivityTrend(params),
  });
}
