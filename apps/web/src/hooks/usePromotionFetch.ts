import { useState, useEffect } from "react";
import { promotionService, Promotion } from "@/lib/services";

interface UsePromotionFetchReturn {
  promotions: Promotion[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const usePromotionFetch = (params?: {
  isActive?: boolean;
  position?: "up" | "down";
}): UsePromotionFetchReturn => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await promotionService.getPromotions(params);
      setPromotions(response.promotions);
    } catch (err) {
      console.error("프로모션 데이터 가져오기 실패:", err);
      setError("프로모션 데이터를 가져오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [params?.isActive, params?.position]);

  return {
    promotions,
    loading,
    error,
    refetch: fetchPromotions,
  };
};

export default usePromotionFetch;
