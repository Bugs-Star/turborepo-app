"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductsService } from "@/lib/api/products";

export const useReorderRecommended = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["products", "recommended", "reorder"],
    mutationFn: (ids: string[]) => ProductsService.reorderRecommended(ids),
    onSettled: () => {
      // 추천 목록/상품 리스트 전반 리패치
      qc.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          (q.queryKey[0] === "products" || q.queryKey[0] === "recommended"),
      });
    },
  });
};
