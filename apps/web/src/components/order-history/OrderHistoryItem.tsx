"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useExpanded } from "@/hooks";

// API 응답 형식에 맞는 타입 정의
interface OrderItem {
  productId: string | { _id: string }; // 백엔드에서 객체로 올 수도 있음
  productName: string;
  productImg: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface OrderHistoryItemType {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalPrice: number;
  paymentMethod: string;
  createdAt: string;
}

interface OrderHistoryItemProps {
  order: OrderHistoryItemType;
}

export default function OrderHistoryItem({ order }: OrderHistoryItemProps) {
  const { isExpanded, toggle } = useExpanded(`order-${order._id}`);
  const router = useRouter();

  const handleImageClick = (productId: string | { _id: string }) => {
    // productId가 객체인 경우 _id를 추출, 문자열인 경우 그대로 사용
    const id =
      typeof productId === "object" && productId?._id
        ? productId._id
        : String(productId);
    router.push(`/menu/${id}?from=order-history`);
  };

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
    toggle();
  };

  const displayItems = isExpanded ? order.items : order.items.slice(0, 2);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
      {/* Header */}
      <div className="mb-3 pointer-events-none">
        <div className="flex justify-between items-start">
          <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
          <p className="text-xs text-gray-400 font-mono">{order.orderNumber}</p>
        </div>
      </div>

      {/* Items Preview */}
      <div className="space-y-2 mb-3">
        {displayItems.map((item, index) => (
          <div
            key={`${order._id}-${item.productId}-${index}`}
            className="flex items-center space-x-3"
          >
            <Image
              src={item.productImg}
              alt={item.productName}
              width={48}
              height={48}
              className="w-12 h-12 rounded-lg object-cover object-center cursor-pointer"
              onClick={() => handleImageClick(item.productId)}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate cursor-default">
                {item.productName}
              </p>
              <p className="text-xs text-gray-500 cursor-default">
                {item.price.toLocaleString()}원 × {item.quantity}개
              </p>
            </div>
          </div>
        ))}
        {order.items.length > 2 && (
          <div
            key={`${order._id}-expand-button`}
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
      <div className="flex justify-between items-center pt-3 border-t border-gray-100 pointer-events-none">
        <div>
          <span className="text-sm text-gray-700 font-semibold">
            총 결제금액
          </span>
          <p className="text-xs text-gray-500 mt-1">
            결제수단:{" "}
            {order.paymentMethod === "card"
              ? "카드"
              : order.paymentMethod === "cash"
                ? "현금"
                : "포인트"}
          </p>
        </div>
        <span className="text-lg font-semibold text-green-800">
          {order.totalPrice.toLocaleString()}원
        </span>
      </div>
    </div>
  );
}
