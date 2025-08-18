import { useQuery } from "@tanstack/react-query";
import { cartService } from "@/lib/services";

export interface CartCountResponse {
  count: number;
}

export const useCartCountFetch = () => {
  return useQuery<CartCountResponse>({
    queryKey: ["cartCount"],
    queryFn: async () => {
      const response = await cartService.getCartCount();
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
  });
};
