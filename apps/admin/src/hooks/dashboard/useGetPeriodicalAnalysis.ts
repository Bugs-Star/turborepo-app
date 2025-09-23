"use client";

import { useQuery } from "@tanstack/react-query";
import {
  DashboardApi,
  type PeriodicalParams,
  type ReportItem,
} from "@/lib/api/dashboard";

const key = (p: PeriodicalParams) =>
  [
    "periodical-analysis",
    p.periodType,
    p.year,
    p.month ?? null,
    p.week ?? null,
  ] as const;

export function useGetPeriodicalAnalysis(params: PeriodicalParams) {
  const enabled =
    params.periodType === "yearly"
      ? !!params.year
      : params.periodType === "monthly"
        ? !!params.year && !!params.month
        : !!params.year && !!params.month && !!params.week;

  return useQuery<ReportItem[]>({
    queryKey: key(params),
    queryFn: () => DashboardApi.getPeriodicalReports(params),
    enabled,
    retry: (count, err: any) => {
      const status = err?.response?.status;
      if ([400, 401, 404].includes(status)) return false;
      return count < 2;
    },
  });
}
