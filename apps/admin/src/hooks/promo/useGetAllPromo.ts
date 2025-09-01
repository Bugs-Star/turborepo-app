"use client";

import { useQuery } from "@tanstack/react-query";
import {
  PromoService,
  type GetPromosParams,
  type GetPromosResponse,
} from "@/lib/api/promo";

export const useGetAllPromo = (params?: GetPromosParams) => {
  return useQuery<GetPromosResponse, Error>({
    queryKey: ["promotions", params],
    queryFn: () => PromoService.getAll(params),
    staleTime: 1000 * 60, // 1분
  });
};
