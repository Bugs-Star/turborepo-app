import { Button } from "@repo/ui";
import { PAYMENT_METHODS, PaymentMethod } from "@/hooks/usePayment";
import { useState } from "react";

interface PaymentModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  onConfirm: (paymentMethod: PaymentMethod["value"]) => void;
  onCancel: () => void;
}

export default function PaymentModal({
  isOpen,
  isProcessing,
  onConfirm,
  onCancel,
}: PaymentModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod["value"]>("card");

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(selectedPaymentMethod);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 max-w-sm mx-4 shadow-2xl">
        <h3 className="text-lg font-bold mb-4 text-gray-900">결제 수단 선택</h3>

        <div className="space-y-3 mb-6">
          {PAYMENT_METHODS.map((method) => (
            <label
              key={method.value}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.value}
                checked={selectedPaymentMethod === method.value}
                onChange={(e) =>
                  setSelectedPaymentMethod(
                    e.target.value as PaymentMethod["value"]
                  )
                }
                className="text-green-600 focus:ring-green-500"
                disabled={isProcessing}
              />
              <span className="text-gray-800 font-medium">{method.label}</span>
            </label>
          ))}
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={onCancel}
            variant="white"
            size="md"
            className="flex-1"
            disabled={isProcessing}
          >
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            variant="green"
            size="md"
            className="flex-1"
            disabled={isProcessing}
          >
            {isProcessing ? "처리 중..." : "결제하기"}
          </Button>
        </div>
      </div>
    </div>
  );
}
