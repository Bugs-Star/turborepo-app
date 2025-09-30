"use client";

import { useQuery } from "@tanstack/react-query";
import {
  DashboardApi,
  type PeriodicalParams,
  type SalesTrendPoint,
} from "@/lib/api/dashboard";

export function useGetSalesTrend(params: PeriodicalParams) {
  return useQuery<SalesTrendPoint[]>({
    queryKey: [
      "sales-trend",
      params.periodType,
      params.year,
      params.month,
      params.week,
    ],
    queryFn: () => DashboardApi.getSalesTrend(params),
  });
}
