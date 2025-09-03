"use client";

import axiosInstance from "@/lib/api/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
axiosInstance;

const buildUrl = (id: string) => `/admin/promotions/${id}`;

type Promotion = {
  _id: string;
  title: string;
  description?: string;
  promotionImg: string; // URL
  startDate?: string;
  endDate?: string;
  isActive: boolean;
};

function patchPromotionInAllCaches(
  qc: ReturnType<typeof useQueryClient>,
  updated: Promotion
) {
  const entries = qc.getQueriesData<{ promotions: Promotion[] }>({
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

  return useMutation({
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
      return data as { promotion: Promotion } | Promotion; // 백엔드 응답 포맷 두 경우 커버
    },

    // ▶ Optimistic Update
    onMutate: async (formData) => {
      await qc.cancelQueries({ queryKey: ["promotions"] });

      // 현재 캐시 스냅샷 (롤백용)
      const previous = qc.getQueriesData({ queryKey: ["promotions"] });

      // formData로 예상 업데이트 객체 구성(제목/설명/날짜만 미리 반영, 이미지도 가능하면 반영)
      const toStr = (v: FormDataEntryValue | null) =>
        typeof v === "string" ? v : "";
      const title = toStr(formData.get("title"));
      const description = toStr(formData.get("description"));
      const startDate = toStr(formData.get("startDate"));
      const endDate = toStr(formData.get("endDate"));
      // 이미지 미리보기 URL로 낙관적 반영하고 싶다면 아래처럼:
      // const file = formData.get("promotionImg") as File | null;
      // const tempUrl = file ? URL.createObjectURL(file) : null;

      // 모든 promotions 캐시에서 해당 아이템 필드만 교체
      const entries = qc.getQueriesData<{ promotions: Promotion[] }>({
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
                // ...(tempUrl ? { promotionImg: tempUrl } : {}), // 필요 시 활성화
              }
            : p
        );
        qc.setQueryData(key, { ...data, promotions: next });
      }

      return { previous }; // 컨텍스트로 롤백 값 전달
    },

    // 서버 성공 → 실제 응답으로 확정치 반영
    onSuccess: (res) => {
      const updated = (
        "promotion" in (res as any) ? (res as any).promotion : res
      ) as Promotion;
      if (updated?._id) {
        patchPromotionInAllCaches(qc, updated);
      } else {
        // 응답에 개별 promotion이 없으면 안전하게 invalidate
        qc.invalidateQueries({ queryKey: ["promotions"] });
      }
    },

    // 실패 → 롤백
    onError: (_err, _vars, ctx) => {
      if (!ctx?.previous) return;
      // previous는 getQueriesData의 결과 배열이므로 그대로 복원
      for (const [key, data] of ctx.previous as any[]) {
        qc.setQueryData(key, data);
      }
    },

    // 정리
    onSettled: () => {
      // 최신 상태 보장(서버가 다른 파생 필드를 갱신하는 경우)
      qc.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
};
