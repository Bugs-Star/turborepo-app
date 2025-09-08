// hooks/promo/useDeletePromo.ts (드롭인 예시)
"use client";

import axiosInstance from "@/lib/api/axios";
import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";

type Promotion = {
  _id: string;
  title: string;
  description?: string;
  promotionImg: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
};

type DeleteResponse = { message: string };
type PromotionsList = { promotions: Promotion[] };

export const useDeletePromo = () => {
  const qc = useQueryClient();

  return useMutation<
    DeleteResponse, // TData
    AxiosError<{ message?: string }>, // TError
    string, // TVariables (promotionId)
    { previous: Array<[QueryKey, unknown]> } // TContext
  >({
    mutationFn: async (promotionId) => {
      const { data } = await axiosInstance.delete(
        `/admin/promotions/${promotionId}`
      );
      return data as DeleteResponse;
    },
    onMutate: async (promotionId) => {
      await qc.cancelQueries({ queryKey: ["promotions"] });
      const previous = qc.getQueriesData({ queryKey: ["promotions"] });

      const entries = qc.getQueriesData<PromotionsList>({
        queryKey: ["promotions"],
      });
      for (const [key, data] of entries) {
        if (!data?.promotions) continue;
        qc.setQueryData(key, {
          ...data,
          promotions: data.promotions.filter((p) => p._id !== promotionId),
        });
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (!ctx?.previous) return;
      for (const [key, data] of ctx.previous) qc.setQueryData(key, data);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
};
