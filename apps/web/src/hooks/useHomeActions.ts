import { useRouter } from "next/navigation";
import { Product } from "@/types";
import { Event, Promotion } from "@/lib/services";
import { useAnalytics } from "./useAnalytics";

export const useHomeActions = () => {
  const router = useRouter();
  const { trackRecommendedProductClick, trackPromotionClick, trackEventClick } =
    useAnalytics();

  const handleProductClick = (product: Product) => {
    // 로거 호출
    trackRecommendedProductClick(product);
    router.push(`menu/${product._id}?from=home`);
  };

  const handlePromoClick = (promotion: Promotion) => {
    // 로거 호출
    trackPromotionClick(promotion);
    router.push(`promotion/${promotion._id}`);
  };

  const handleEventClick = (event: Event) => {
    // 로거 호출
    trackEventClick(event);
    router.push(`event/${event._id}`);
  };

  return {
    handleProductClick,
    handlePromoClick,
    handleEventClick,
  };
};
