import { useQuery } from "@tanstack/react-query";
import {
  DashboardApi,
  type PeriodicalParams,
  type BestSellerItem,
} from "@/lib/api/dashboard";

export function useGetBestSeller(params: PeriodicalParams) {
  const enabled =
    params.periodType === "yearly"
      ? !!params.year
      : params.periodType === "monthly"
        ? !!params.year && params.month != null
        : !!params.year && params.month != null && params.week != null;

  return useQuery<BestSellerItem[]>({
    queryKey: [
      "best-sellers",
      params.periodType,
      params.year,
      params.month ?? null,
      params.week ?? null,
    ],
    queryFn: () => DashboardApi.getBestSellers(params),
    enabled,
  });
}
