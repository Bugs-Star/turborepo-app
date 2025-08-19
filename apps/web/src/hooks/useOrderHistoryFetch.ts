import { useState, useEffect } from "react";
import { orderService } from "@/lib/services";
import { tokenManager } from "@/lib/api";

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

  const fetchOrderHistory = async (page: number = 1, limit: number = 10) => {
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
  };

  useEffect(() => {
    // 토큰이 있을 때만 주문 내역 조회
    if (tokenManager.hasTokens()) {
      fetchOrderHistory();
    } else {
      setLoading(false);
      setError("로그인이 필요합니다.");
    }
  }, []);

  return {
    orderHistory,
    loading,
    error,
    pagination,
    refetch: fetchOrderHistory,
  };
};
