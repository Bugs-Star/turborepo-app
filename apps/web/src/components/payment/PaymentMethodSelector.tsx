import { PAYMENT_METHODS, PaymentMethod } from "@/hooks/usePayment";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod["value"];
  onMethodChange: (method: PaymentMethod["value"]) => void;
  disabled?: boolean;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  disabled = false,
}: PaymentMethodSelectorProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <h3 className="text-lg font-bold mb-3 text-gray-900">결제 수단 선택</h3>

      <div className="space-y-3">
        {PAYMENT_METHODS.map((method) => (
          <label
            key={method.value}
            className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-green-600 transition-colors"
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.value}
              checked={selectedMethod === method.value}
              onChange={(e) =>
                onMethodChange(e.target.value as PaymentMethod["value"])
              }
              className="accent-green-700"
              disabled={disabled}
            />
            <span className="text-gray-800 font-medium">{method.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
