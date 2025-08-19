interface CartSummaryProps {
  total: number;
}

export default function CartSummary({ total }: CartSummaryProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-700">소계:</span>
        <span className="text-gray-900 font-medium">
          {total.toLocaleString()}원
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-700 font-semibold text-lg">총계:</span>
        <span className="text-green-700 font-semibold text-lg">
          {total.toLocaleString()}원
        </span>
      </div>
    </div>
  );
}
