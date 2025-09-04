"use client";

import { useReorderList, ReorderUpdate } from "../useReorderList";
import {
  PromoService,
  GetPromosResponse,
  PromoResponse,
} from "@/lib/api/promo";

export const useReorderPromos = () => {
  return useReorderList<GetPromosResponse, PromoResponse>({
    // ⚠️ useGetAllPromo의 루트 queryKey에 맞춰야 함 (보통 "promotions")
    queryKeyRoot: "promotions",

    getList: (d) => d.promotions,
    setList: (d, next) => ({ ...d, promotions: next }),
    getId: (p) => p._id,
    setOrder: (p, order) => ({ ...p, promotionOrder: order }),

    // UI 정렬 기준(낙관적 정렬): promotionOrder ASC → tie는 _id
    sort: (a, b) => {
      const ao =
        typeof a.promotionOrder === "number"
          ? a.promotionOrder
          : Number.MAX_SAFE_INTEGER;
      const bo =
        typeof b.promotionOrder === "number"
          ? b.promotionOrder
          : Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return a._id.localeCompare(b._id);
    },

    // ✅ 서버 배치 호출: 드래그 후의 "전체" updates가 들어온다고 가정
    persist: async (updates: ReorderUpdate[]) => {
      const promotionIds = [...updates]
        .sort((a, b) => a.order - b.order)
        .map((u) => u.id);
      await PromoService.reorderPromotions(promotionIds);
    },
  });
};
