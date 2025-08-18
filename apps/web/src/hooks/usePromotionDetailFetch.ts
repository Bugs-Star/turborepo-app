import { useState, useEffect } from "react";
import { promotionService, Promotion } from "@/lib/services";

interface UsePromotionDetailFetchReturn {
  promotion: Promotion | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const usePromotionDetailFetch = (id: string): UsePromotionDetailFetchReturn => {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotion = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await promotionService.getPromotion(id);
      setPromotion(response.promotion);
    } catch (err) {
      console.error("프로모션 상세 정보 가져오기 실패:", err);
      setError("프로모션 정보를 가져오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPromotion();
    }
  }, [id]);

  return {
    promotion,
    loading,
    error,
    refetch: fetchPromotion,
  };
};

export default usePromotionDetailFetch;
