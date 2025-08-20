import { useState, useEffect, useCallback } from "react";
import { orderService } from "@/lib/services";
import { useAuthStore } from "@/stores/authStore";

export interface OrderHistoryItem {
  _id: string;
  orderNumber: string;
  items: {
    productId: string;
    productName: string;
    productImg: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
  totalPrice: number;
  paymentMethod: string;
  createdAt: string;
}

export interface OrderHistoryResponse {
  orders: OrderHistoryItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
  };
}

export const useOrderHistoryFetch = () => {
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<
    OrderHistoryResponse["pagination"] | null
  >(null);

  const { isAuthenticated } = useAuthStore();

  const fetchOrderHistory = useCallback(
    async (page: number = 1, limit: number = 10) => {
      try {
        setLoading(true);
        setError(null);

        const response = await orderService.getOrderHistory();
        setOrderHistory(response.orders);
        setPagination(response.pagination);
      } catch (err) {
        console.error("주문 내역 조회 실패:", err);
        setError("주문 내역을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // 인증된 상태일 때만 주문 내역 조회
    if (isAuthenticated) {
      fetchOrderHistory();
    } else {
      setLoading(false);
      setError("로그인이 필요합니다.");
    }
  }, [isAuthenticated, fetchOrderHistory]);

  return {
    orderHistory,
    loading,
    error,
    pagination,
    refetch: fetchOrderHistory,
  };
};
