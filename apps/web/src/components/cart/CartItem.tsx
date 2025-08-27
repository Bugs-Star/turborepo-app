"use client";

import Image from "next/image";
import { CartItemUI } from "@/types/cart";
import { Trash2 } from "lucide-react";

interface CartItemProps {
  item: CartItemUI;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export default function CartItem({
  item,
  onQuantityChange,
  onRemove,
  disabled = false,
}: CartItemProps) {
  const handleQuantityChange = (newQuantity: number) => {
    if (disabled) return;
    if (newQuantity >= 1) {
      onQuantityChange(item.id, newQuantity);
    }
  };

  const handleRemove = () => {
    if (disabled) return;

    // 기존 제거 로직
    onRemove(item.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
      <div className="flex items-center space-x-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={80}
            height={80}
            className="w-20 h-20 rounded-lg object-cover object-center"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            {item.name}
          </h3>
          <p className="text-sm font-semibold text-green-700 mb-3">
            {item.price.toLocaleString()}원
          </p>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={disabled}
                className={`px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-l-lg transition-colors ${
                  disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                -
              </button>
              <span className="px-3 py-1 text-sm font-medium text-gray-900">
                {item.quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={disabled}
                className={`px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-r-lg transition-colors ${
                  disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                +
              </button>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              disabled={disabled}
              className={`flex items-center text-red-600 text-sm hover:text-red-700 transition-colors cursor-pointer ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Trash2 size={16} className="mr-1" />
              제거
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
