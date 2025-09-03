"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PromoService,
  AddPromoPayload,
  PromoResponse,
  GetPromosResponse,
  GetPromosParams,
} from "@/lib/api/promo";

export const useAddPromo = () => {
  const qc = useQueryClient();

  return useMutation<PromoResponse, unknown, AddPromoPayload>({
    mutationFn: (payload) => PromoService.addPromo(payload),

    // 생성 직후 캐시 즉시 반영 + 최신화
    onSuccess: (created) => {
      // 1) ["promos", params] 형태의 모든 캐시에 즉시 끼워넣기
      const entries = qc.getQueriesData<GetPromosResponse>({
        queryKey: ["promos"],
      });

      for (const [key, data] of entries) {
        if (!data) continue;
        const [, params] = key as [string, GetPromosParams | undefined];

        // 필터 조건이 있을 경우 맞을 때만 반영

        if (
          typeof params?.isActive === "boolean" &&
          params.isActive !== created.isActive
        )
          continue;
      }

      // 2) 서버 정렬/페이지 반영까지 동기화
      qc.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) && q.queryKey[0] === "promos",
        refetchType: "active",
      });
    },
  });
};
