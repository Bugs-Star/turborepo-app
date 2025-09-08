"use client";

import axiosInstance from "@/lib/api/axios";
import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";

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

type PromotionsListCache = { promotions: Promotion[] };
type PromotionsCacheEntry = [QueryKey, PromotionsListCache | undefined];
type PromotionsCacheSnapshot = PromotionsCacheEntry[];

// 서버 응답이 두 형태일 수 있어 유니온으로 처리
type PromotionResponse = Promotion | { promotion: Promotion };

function normalizePromotionResponse(res: PromotionResponse): Promotion {
  return "promotion" in res ? res.promotion : res;
}

function patchPromotionInAllCaches(
  qc: ReturnType<typeof useQueryClient>,
  updated: Promotion
) {
  const entries = qc.getQueriesData<PromotionsListCache>({
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
    PromotionResponse,
    Error,
    FormData,
    { previous: PromotionsCacheSnapshot }
  >({
    // FormData 전송(이미지 포함)
    mutationFn: async (formData: FormData) => {
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
      return data as PromotionResponse;
    },

    // ▶ Optimistic Update
    onMutate: async (formData: FormData) => {
      await qc.cancelQueries({ queryKey: ["promotions"] });

      // 현재 캐시 스냅샷 (롤백용)
      const previous = qc.getQueriesData<PromotionsListCache>({
        queryKey: ["promotions"],
      });

      // formData에서 미리 반영할 수 있는 값 추출
      const toStr = (v: FormDataEntryValue | null) =>
        typeof v === "string" ? v : "";
      const title = toStr(formData.get("title"));
      const description = toStr(formData.get("description"));
      const startDate = toStr(formData.get("startDate"));
      const endDate = toStr(formData.get("endDate"));

      // 모든 promotions 캐시에서 해당 아이템 필드만 교체
      const entries = qc.getQueriesData<PromotionsListCache>({
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

      return { previous };
    },

    // 서버 성공 → 실제 응답으로 확정치 반영
    onSuccess: (res) => {
      const updated = normalizePromotionResponse(res);
      if (updated?._id) {
        patchPromotionInAllCaches(qc, updated);
      } else {
        // 방어적 처리
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
