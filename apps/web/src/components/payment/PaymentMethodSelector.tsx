import { PAYMENT_METHODS, PaymentMethod } from "@/types/payment";
import { usePaymentStore } from "@/stores/paymentStore";

interface PaymentMethodSelectorProps {
  disabled?: boolean;
}

export default function PaymentMethodSelector({
  disabled = false,
}: PaymentMethodSelectorProps) {
  const { selectedMethod, lastUsedMethod, setSelectedMethod } =
    usePaymentStore();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <h3 className="text-lg font-bold mb-3 text-gray-900">결제 수단 선택</h3>

      <div className="space-y-3">
        {PAYMENT_METHODS.map((method) => {
          const isLastUsed = lastUsedMethod === method.value;
          const isSelected = selectedMethod === method.value;

          return (
            <label
              key={method.value}
              className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border transition-colors ${
                isSelected
                  ? "border-green-600 bg-green-50"
                  : "border-gray-200 hover:border-green-600"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.value}
                checked={isSelected}
                onChange={(e) =>
                  setSelectedMethod(e.target.value as PaymentMethod["value"])
                }
                className="accent-green-800"
                disabled={disabled}
              />
              <div className="flex-1 flex items-center justify-between">
                <span className="text-gray-800 font-medium">
                  {method.label}
                </span>
                {isLastUsed && (
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    최근에 사용
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
