import { useRouter } from "next/navigation";
import { Product, Event } from "@/lib/services";

export const useHomeActions = () => {
  const router = useRouter();

  const handleProductClick = (product: Product) => {
    router.push(`/menu/${product._id}`);
  };

  const handlePromoClick = (promotionId: string) => {
    router.push(`/promotion/${promotionId}`);
  };

  const handleEventClick = (event: Event) => {
    router.push(`/event/${event._id}`);
  };

  return {
    handleProductClick,
    handlePromoClick,
    handleEventClick,
  };
};
