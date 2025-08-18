import { useQuery } from "@tanstack/react-query";
import { promotionService } from "@/lib/services";

export const usePromotionDetailFetch = (id: string) => {
  return useQuery({
    queryKey: ["promotion", id],
    queryFn: async () => {
      const response = await promotionService.getPromotion(id);
      return response.promotion;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};
