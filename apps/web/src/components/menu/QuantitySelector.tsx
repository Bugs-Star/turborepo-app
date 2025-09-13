import { useToast } from "@/hooks/useToast";
import { Product } from "@/types";

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  isOutOfStock: boolean;
  product: Product;
}

export default function QuantitySelector({
  quantity,
  onQuantityChange,
  isOutOfStock,
  product,
}: QuantitySelectorProps) {
  const { showWarning } = useToast();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      onQuantityChange(newQuantity);
    }
  };

  const handleIncreaseQuantity = () => {
    const newQuantity = quantity + 1;

    // 재고 초과 검증
    if (newQuantity > product.currentStock) {
      showWarning(`재고가 부족합니다. (현재 재고: ${product.currentStock}개)`);
      return;
    }

    handleQuantityChange(newQuantity);
  };

  // 재고가 없는 경우 수량 선택기를 표시하지 않음
  if (isOutOfStock) {
    return null;
  }

  return (
    <div className="fixed bottom-36 left-1/2 transform -translate-x-1/2 w-full max-w-lg">
      <div
        className="flex items-center justify-center bg-white py-3 px-6 rounded-t-3xl"
        style={{ boxShadow: "0 -4px 6px -1px rgba(0, 0, 0, 0.1)" }}
      >
        <button
          onClick={() => handleQuantityChange(quantity - 1)}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
          disabled={quantity <= 1}
        >
          <span className="text-lg font-medium">-</span>
        </button>

        <span className="mx-8 text-lg font-semibold text-black min-w-[2rem] text-center">
          {quantity}
        </span>

        <button
          onClick={handleIncreaseQuantity}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
          disabled={quantity >= 99}
        >
          <span className="text-lg font-medium">+</span>
        </button>
      </div>
    </div>
  );
}
