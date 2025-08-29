"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductsService, GetProductsResponse } from "@/lib/products";

export const useDeleteMenu = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => ProductsService.deleteProduct(productId),

    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: ["products"] });

      const previous = qc.getQueryData<GetProductsResponse>(["products"]);

      if (previous) {
        qc.setQueryData<GetProductsResponse>(["products"], {
          ...previous,
          products: previous.products.filter((p) => p._id !== productId),
          pagination: {
            ...previous.pagination,
            totalItems: Math.max(previous.pagination.totalItems - 1, 0),
          },
        });
      }

      return { previous };
    },

    // 실패 시 롤백
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(["products"], ctx.previous);
    },

    // 성공/실패와 무관하게 최신화
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
