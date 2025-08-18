"use client";

import { BottomNavigation } from "@/components/layout";
import { PageHeader, AuthGuard } from "@/components/ui";
import { OrderHistoryItem } from "@/components/order-history";
import { useOrderHistoryFetch } from "@/hooks";

export default function OrderHistoryPage() {
  const { orderHistory, loading, error, refetch } = useOrderHistoryFetch();

  return (
    <AuthGuard backgroundColor="bg-white" title="주문 내역" showHeader={true}>
      <div className="min-h-screen bg-white flex flex-col pb-20">
        <PageHeader title="주문 내역" />

        {/* Main Content */}
        <div className="flex-1 px-4 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">주문 내역을 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                다시 시도
              </button>
            </div>
          ) : orderHistory.length > 0 ? (
            <div className="space-y-4">
              {orderHistory.map((order) => (
                <OrderHistoryItem key={order._id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">주문 내역이 없습니다.</p>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </AuthGuard>
  );
}
