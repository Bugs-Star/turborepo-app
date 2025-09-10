"use client";

import { BottomNavigation } from "@/components/layout";
import { PageHeader, AuthGuard, AsyncWrapper } from "@/components/ui";
import { OrderHistoryItem } from "@/components/order-history";
import { useOrderHistoryFetch } from "@/hooks";

export default function OrderHistoryPage() {
  const {
    orderHistory,
    loading,
    error,
    refetch,
    loadingMore,
    hasMoreOrders,
    handleLoadMore,
  } = useOrderHistoryFetch();

  return (
    <AuthGuard backgroundColor="bg-white" title="주문 내역" showHeader={true}>
      <div className="min-h-screen bg-white flex flex-col pb-20">
        <PageHeader title="주문 내역" />

        {/* Main Content - 여백 추가 */}
        <div className="pt-18 flex-1 px-6 py-6">
          <AsyncWrapper
            loading={loading}
            error={error}
            loadingMessage="주문 내역을 불러오는 중..."
            errorMessage="잠시 후 다시 시도해주세요."
            onRetry={refetch}
          >
            {orderHistory.length > 0 ? (
              <div className="space-y-4">
                {orderHistory.map((order) => (
                  <OrderHistoryItem key={order._id} order={order} />
                ))}

                {/* 더보기 버튼 */}
                {hasMoreOrders && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-800 hover:font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingMore ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
                          <span>불러오는 중...</span>
                        </>
                      ) : (
                        <>
                          더 보기
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">주문 내역이 없습니다.</p>
              </div>
            )}
          </AsyncWrapper>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </AuthGuard>
  );
}
