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

// 훅의 반환 타입을 명확하게 정의
export interface UseOrderHistoryFetchReturn {
  orderHistory: OrderHistoryItem[];
  loading: boolean;
  error: string | null;
  pagination: OrderHistoryResponse["pagination"] | null;
  refetch: () => void;
  loadingMore: boolean;
  hasMoreOrders: boolean;
  handleLoadMore: () => Promise<void>;
}

export const useOrderHistoryFetch = (): UseOrderHistoryFetchReturn => {
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<
    OrderHistoryResponse["pagination"] | null
  >(null);

  // "더 보기" 기능을 위한 상태
  const [loadingMore, setLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 10;

  const { isAuthenticated } = useAuthStore();

  const fetchOrderHistory = useCallback(async (page: number = 1) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const response = await orderService.getOrderHistory({
        page,
        limit: ITEMS_PER_PAGE,
      });

      if (page === 1) {
        // 첫 페이지: 기존 데이터 교체
        setOrderHistory(response.orders);
      } else {
        // 추가 페이지: 기존 데이터에 추가
        setOrderHistory((prev) => [...prev, ...response.orders]);
      }

      setPagination(response.pagination);
    } catch (err) {
      console.error("주문 내역 조회 실패:", err);
      setError("주문 내역을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // "더 보기" 버튼 클릭 핸들러
  const handleLoadMore = useCallback(async () => {
    if (!pagination || loadingMore) return;

    const nextPage = pagination.currentPage + 1;
    if (nextPage <= pagination.totalPages) {
      await fetchOrderHistory(nextPage);
    }
  }, [pagination, loadingMore, fetchOrderHistory]);

  // 더 보기 버튼 표시 여부 - 단순화된 로직
  const hasMoreOrders = pagination
    ? orderHistory.length < pagination.totalOrders
    : false;

  useEffect(() => {
    // 인증된 상태일 때만 주문 내역 조회
    if (isAuthenticated) {
      fetchOrderHistory(1);
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
    refetch: () => fetchOrderHistory(1),
    // "더 보기" 관련 상태와 함수들
    loadingMore,
    hasMoreOrders,
    handleLoadMore,
  };
};
