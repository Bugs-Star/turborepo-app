import { useQuery } from "@tanstack/react-query";
import { promotionService } from "@/lib/services";

export const usePromotionFetch = (params?: {
  isActive?: boolean;
  position?: "up" | "down";
}) => {
  return useQuery({
    queryKey: ["promotions", params],
    queryFn: async () => {
      const response = await promotionService.getPromotions(params);
      return response.promotions;
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};
