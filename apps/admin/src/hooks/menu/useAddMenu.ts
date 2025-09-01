"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ProductsService,
  AddProductPayload,
  ProductResponse,
  GetProductsResponse,
  GetProductsParams,
} from "@/lib/api/products";

export const useAddMenu = () => {
  const qc = useQueryClient();

  return useMutation<ProductResponse, unknown, AddProductPayload>({
    mutationFn: (payload) => ProductsService.addProduct(payload),

    // 생성 직후 캐시 즉시 반영 + 최신화
    onSuccess: (created) => {
      // 1) ["products", params] 형태의 모든 캐시에 즉시 끼워넣기
      const entries = qc.getQueriesData<GetProductsResponse>({
        queryKey: ["products"],
      });
      for (const [key, data] of entries) {
        if (!data) continue;
        const [, params] = key as [string, GetProductsParams | undefined];

        // 필터 탭일 경우 조건 맞을 때만 반영
        if (params?.category && params.category !== created.category) continue;
        if (
          typeof params?.isRecommended === "boolean" &&
          params.isRecommended &&
          !created.isRecommended
        )
          continue;

        const pageSize = data.pagination?.itemsPerPage ?? data.products.length;
        qc.setQueryData<GetProductsResponse>(key, {
          ...data,
          products: [created, ...data.products].slice(0, pageSize),
          pagination: data.pagination
            ? { ...data.pagination, totalItems: data.pagination.totalItems + 1 }
            : data.pagination,
        });
      }

      // 2) 서버 정렬/페이지 반영까지 동기화
      qc.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) && q.queryKey[0] === "products",
        refetchType: "active",
      });
    },
  });
};
