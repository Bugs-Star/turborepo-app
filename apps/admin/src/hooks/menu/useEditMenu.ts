import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductsService, AddProductPayload } from "@/lib/products";

export const useEditMenu = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<AddProductPayload>) =>
      ProductsService.editProduct(productId, data),
    onSuccess: () => {
      // 수정 후 product 관련 캐시 갱신
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
