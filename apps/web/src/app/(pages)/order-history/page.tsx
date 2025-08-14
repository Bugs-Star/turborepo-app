"use client";

import { useState } from "react";
import { BottomNavigation } from "@/components/layout";
import { PageHeader, AuthGuard } from "@/components/ui";
import { OrderHistoryItem } from "@/components/order-history";
import {
  dummyOrderHistory,
  OrderHistoryItem as OrderHistoryItemType,
} from "@/constants/dummyData";

export default function OrderHistoryPage() {
  const [orderHistory] = useState<OrderHistoryItemType[]>(dummyOrderHistory);

  return (
    <AuthGuard backgroundColor="bg-white" title="주문 내역" showHeader={true}>
      <div className="min-h-screen bg-white flex flex-col pb-20">
        <PageHeader title="주문 내역" />

        {/* Main Content */}
        <div className="flex-1 px-4 py-6">
          {orderHistory.length > 0 ? (
            <div className="space-y-4">
              {orderHistory.map((order) => (
                <OrderHistoryItem key={order.id} order={order} />
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
