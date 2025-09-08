"use client";

import axiosInstance from "@/lib/api/axios";
import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";

const buildUrl = (id: string) => `/admin/promotions/${id}`;

export type Promotion = {
  _id: string;
  title: string;
  description?: string;
  promotionImg: string; // URL
  startDate?: string;
  endDate?: string;
  isActive: boolean;
};

// 캐시에 들어있는 리스트 형태
type PromotionsList = { promotions: Promotion[] };

// 서버 응답: Promotion 단일 또는 { promotion: Promotion }
type EditPromoResponse = Promotion | { promotion: Promotion };

// 타입 가드
function isWrappedPromotion(v: unknown): v is { promotion: Promotion } {
  return (
    typeof v === "object" &&
    v !== null &&
    "promotion" in v &&
    typeof (v as any).promotion === "object" &&
    (v as any).promotion !== null &&
    typeof (v as any).promotion._id === "string"
  );
}

// 폰트 캐시 업데이트
function patchPromotionInAllCaches(
  qc: ReturnType<typeof useQueryClient>,
  updated: Promotion
) {
  const entries = qc.getQueriesData<PromotionsList>({
    queryKey: ["promotions"],
  });
  for (const [key, data] of entries) {
    if (!data?.promotions) continue;
    const next = data.promotions.map((p) =>
      p._id === updated._id ? { ...p, ...updated } : p
    );
    qc.setQueryData(key, { ...data, promotions: next });
  }
}

export const useEditPromo = (promotionId: string) => {
  const qc = useQueryClient();

  return useMutation<
    EditPromoResponse, // TData
    AxiosError<{ message?: string }>, // TError
    FormData, // TVariables
    { previous: Array<[QueryKey, unknown]> } // TContext
  >({
    mutationFn: async (formData) => {
      if (!promotionId || promotionId.length !== 24) {
        throw new Error(`Invalid promotionId: ${promotionId}`);
      }
      const { data } = await axiosInstance.put(
        buildUrl(promotionId),
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return data as EditPromoResponse;
    },

    // ▶ Optimistic Update
    onMutate: async (formData) => {
      await qc.cancelQueries({ queryKey: ["promotions"] });

      // 현재 캐시 스냅샷 (롤백용)
      const previous = qc.getQueriesData({ queryKey: ["promotions"] });

      // formData의 주요 필드만 미리 반영
      const toStr = (v: FormDataEntryValue | null) =>
        typeof v === "string" ? v : "";

      const title = toStr(formData.get("title"));
      const description = toStr(formData.get("description"));
      const startDate = toStr(formData.get("startDate"));
      const endDate = toStr(formData.get("endDate"));

      const entries = qc.getQueriesData<PromotionsList>({
        queryKey: ["promotions"],
      });
      for (const [key, data] of entries) {
        if (!data?.promotions) continue;
        const next = data.promotions.map((p) =>
          p._id === promotionId
            ? {
                ...p,
                ...(title ? { title } : {}),
                ...(description ? { description } : {}),
                ...(startDate ? { startDate } : {}),
                ...(endDate ? { endDate } : {}),
              }
            : p
        );
        qc.setQueryData(key, { ...data, promotions: next });
      }

      // 컨텍스트 반환 (롤백용)
      return { previous };
    },

    // 서버 성공 → 실제 응답으로 확정치 반영
    onSuccess: (res) => {
      const updated: Promotion = isWrappedPromotion(res)
        ? res.promotion
        : (res as Promotion);

      if (updated?._id) {
        patchPromotionInAllCaches(qc, updated);
      } else {
        qc.invalidateQueries({ queryKey: ["promotions"] });
      }
    },

    // 실패 → 롤백
    onError: (_err, _vars, ctx) => {
      if (!ctx?.previous) return;
      for (const [key, data] of ctx.previous) {
        qc.setQueryData(key, data);
      }
    },

    // 정리
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
};
