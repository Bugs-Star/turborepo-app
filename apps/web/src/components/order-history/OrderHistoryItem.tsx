"use client";

import { useState } from "react";
import { OrderHistoryItem as OrderHistoryItemType } from "@/constants/dummyData";
import { ChevronRight, ChevronDown } from "lucide-react";

interface OrderHistoryItemProps {
  order: OrderHistoryItemType;
}

export default function OrderHistoryItem({ order }: OrderHistoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const displayItems = isExpanded ? order.items : order.items.slice(0, 2);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
      {/* Header */}
      <div className="mb-3">
        <p className="text-xs text-gray-500">{formatDate(order.orderDate)}</p>
      </div>

      {/* Items Preview */}
      <div className="space-y-2 mb-3">
        {displayItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-3">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-12 h-12 rounded-lg object-cover object-center"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">{item.name}</p>
              <p className="text-xs text-gray-500">
                {item.price.toLocaleString()}원 × {item.quantity}개
              </p>
            </div>
          </div>
        ))}
        {order.items.length > 2 && (
          <div
            className="text-xs text-gray-500 text-center cursor-pointer hover:text-gray-700 transition-colors py-1"
            onClick={handleExpandClick}
          >
            {isExpanded ? (
              <div className="flex items-center justify-center space-x-1">
                <ChevronDown size={14} />
                <span>접기</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-1">
                <ChevronRight size={14} />
                <span>외 {order.items.length - 2}개 상품 더보기</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <span className="text-sm text-gray-700 font-semibold">총 결제금액</span>
        <span className="text-lg font-semibold text-green-600">
          {order.totalAmount.toLocaleString()}원
        </span>
      </div>
    </div>
  );
}
