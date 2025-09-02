"use client";

import axiosInstance from "@/lib/api/axios";
import { notify } from "@/lib/notify";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Promotion = {
  _id: string;
  title: string;
  description?: string;
  promotionImg: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
};

export const useDeletePromo = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (promoId: string) => {
      if (!promoId || promoId.length !== 24) {
        throw new Error(`Invalid promotionId: ${promoId}`);
      }
      const { data } = await axiosInstance.delete(
        `/admin/promotions/${promoId}`
      );
      return data as { success?: boolean; message?: string };
    },

    // ▶ Optimistic Update: 모든 ["promotions", *] 캐시에서 해당 항목 제거
    onMutate: async (promoId) => {
      await qc.cancelQueries({ queryKey: ["promotions"] });

      const previous = qc.getQueriesData({ queryKey: ["promotions"] });

      const entries = qc.getQueriesData<{ promotions: Promotion[] }>({
        queryKey: ["promotions"],
      });
      for (const [key, data] of entries) {
        if (!data?.promotions) continue;
        const next = data.promotions.filter((p) => p._id !== promoId);
        qc.setQueryData(key, { ...data, promotions: next });
      }

      return { previous };
    },

    onSuccess: (res) => {
      notify.success("프로모션이 삭제되었습니다.");
    },

    onError: (err: any, _vars, ctx) => {
      // 롤백
      if (ctx?.previous) {
        for (const [key, data] of ctx.previous as any[]) {
          qc.setQueryData(key, data);
        }
      }
      const msg = err?.response?.data?.message || "삭제에 실패했습니다.";
      notify.error(msg);
      console.error(
        "[DeletePromo error]",
        err?.response?.status,
        err?.response?.data
      );
    },

    onSettled: () => {
      // 서버 파생 필드 동기화
      qc.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
};
