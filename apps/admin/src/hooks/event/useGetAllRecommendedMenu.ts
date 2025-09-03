// hooks/menu/useGetAllRecommendedMenu.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductsService, GetProductsResponse } from "@/lib/api/products";

/**
 * 추천메뉴만 조회하는 훅
 * @param page 기본 1
 * @param limit 기본 50
 */
export const useGetAllRecommendedMenu = (page = 1, limit = 50) => {
  return useQuery<GetProductsResponse, Error>({
    queryKey: ["products", { isRecommended: true, page, limit }],
    queryFn: () => ProductsService.getAll({ isRecommended: true, page, limit }),
    staleTime: 60 * 1000, // 1분
    // 클라에서 추천순서 기준 정렬
    select: (data) => ({
      ...data,
      products: [...data.products].sort(
        (a, b) =>
          (a.recommendedOrder ?? 0) - (b.recommendedOrder ?? 0) ||
          a.productName.localeCompare(b.productName)
      ),
    }),
  });
};
