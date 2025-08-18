import { useQuery } from "@tanstack/react-query";
import { cartService } from "@/lib/services";

export interface CartItem {
  _id: string;
  productId: string;
  quantity: number;
  product: {
    _id: string;
    productName: string;
    productImg: string;
    price: number;
    category: string;
  };
  subtotal: number;
  isAvailable: boolean;
  stockStatus: string;
}

export interface CartSummary {
  totalAmount: number;
  totalItems: number;
  itemCount: number;
  availableItems: number;
  outOfStockItems: number;
}

export interface CartResponse {
  cart: CartItem[];
  summary: CartSummary;
}

export const useCartFetch = () => {
  return useQuery<CartResponse>({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await cartService.getCart();
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
  });
};
