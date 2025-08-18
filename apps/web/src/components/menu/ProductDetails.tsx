import { Product } from "@/lib/services";

// 가격 포맷팅 함수
const formatPrice = (price: number) => {
  return price.toLocaleString() + "원";
};

interface ProductDetailsProps {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

export default function ProductDetails({
  product,
  quantity,
  onQuantityChange,
}: ProductDetailsProps) {
  const isOutOfStock = product.currentStock <= 0;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      onQuantityChange(newQuantity);
    }
  };

  return (
    <div className="px-6 py-6">
      <h2 className="text-2xl font-bold text-black mb-2">
        {product.productName}
      </h2>
      <p className="text-xl font-semibold text-green-700 mb-4">
        {formatPrice(product.price)}
      </p>

      <p className="text-gray-600 text-sm leading-relaxed mb-6">
        {product.productContents}
      </p>

      {/* Quantity Selector - 재고가 있을 때만 표시 */}
      {!isOutOfStock && (
        <div className="flex items-center justify-center mb-8">
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
            onClick={() => handleQuantityChange(quantity + 1)}
            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
            disabled={quantity >= 99}
          >
            <span className="text-lg font-medium">+</span>
          </button>
        </div>
      )}
    </div>
  );
}
