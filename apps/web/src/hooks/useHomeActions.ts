import { useRouter } from "next/navigation";
import { Product } from "@/types";
import { Event } from "@/lib/services";
import { useAnalytics } from "./useAnalytics";

export const useHomeActions = () => {
  const router = useRouter();
  const { trackRecommendedProductClick, trackPromotionView, trackEventView } =
    useAnalytics();

  const handleProductClick = (product: Product) => {
    // 로거 호출 (기존 로직 유지)
    trackRecommendedProductClick(product);
    router.push(`/menu/${product._id}`);
  };

  const handlePromoClick = (promotionId: string) => {
    // 로거 호출 (기존 로직 유지)
    trackPromotionView({ _id: promotionId, title: "프로모션" } as any);
    router.push(`/promotion/${promotionId}`);
  };

  const handleEventClick = (event: Event) => {
    // 로거 호출 (기존 로직 유지)
    trackEventView(event);
    router.push(`/event/${event._id}`);
  };

  return {
    handleProductClick,
    handlePromoClick,
    handleEventClick,
  };
};
