"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CustomerService,
  type GetRecentPurchasesResponse,
} from "@/lib/api/customer";

export function useGetRecentPurchases(userId?: string, page = 1, limit = 10) {
  return useQuery<GetRecentPurchasesResponse, Error>({
    queryKey: ["user-purchases", userId, page, limit],
    enabled: !!userId, // userId 있을 때만 호출
    queryFn: () => CustomerService.getRecentPurchases(userId!, page, limit),
    staleTime: 60_000,
  });
}
