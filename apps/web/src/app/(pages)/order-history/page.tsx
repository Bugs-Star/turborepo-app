"use client";

import { BottomNavigation } from "@/components/layout";
import { PageHeader, AuthGuard, AsyncWrapper } from "@/components/ui";
import { OrderHistoryItem } from "@/components/order-history";
import { useOrderHistoryFetch } from "@/hooks";

export default function OrderHistoryPage() {
  const { orderHistory, loading, error, refetch } = useOrderHistoryFetch();

  return (
    <AuthGuard backgroundColor="bg-white" title="주문 내역" showHeader={true}>
      <AsyncWrapper
        loading={loading}
        error={error}
        loadingMessage="주문 내역을 불러오는 중..."
        errorMessage="잠시 후 다시 시도해주세요."
        onRetry={refetch}
      >
        <div className="min-h-screen bg-white flex flex-col pb-20">
          <PageHeader title="주문 내역" />

          {/* Main Content */}
          <div className="flex-1 px-4 py-6">
            {orderHistory.length > 0 ? (
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
      </AsyncWrapper>
    </AuthGuard>
  );
}
