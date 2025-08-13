import { Product } from "@/lib/services";

// 가격 포맷팅 함수
const formatPrice = (price: number) => {
  return price.toLocaleString() + "원";
};

// 상품 설명 매핑 (임시로 하드코딩, 나중에 API에서 가져올 수 있음)
const getProductDescription = (productName: string) => {
  const descriptions: { [key: string]: string } = {
    "아이스 아메리카노":
      "에스프레소와 물을 섞어 만든 시원하고 상쾌한 음료입니다. 깔끔하고 부드러운 맛이 특징이며, 얼음과 함께 제공되어 갈증 해소에 완벽한 선택입니다. 하루를 시작하거나 휴식을 취할 때 최적의 음료입니다.",
    "핫 아메리카노":
      "에스프레소와 뜨거운 물을 섞어 만든 따뜻하고 진한 커피입니다. 깊은 풍미와 향이 특징이며, 차분한 시간을 보내기에 완벽한 음료입니다.",
    카페라떼:
      "에스프레소와 부드러운 우유를 섞어 만든 크림 같은 음료입니다. 달콤하고 부드러운 맛이 특징이며, 커피 입문자에게도 좋은 선택입니다.",
    카푸치노:
      "에스프레소, 우유, 우유 거품을 1:1:1 비율로 섞어 만든 이탈리안 스타일 음료입니다. 진한 커피 맛과 부드러운 거품의 조화가 특징입니다.",
  };

  return (
    descriptions[productName] ||
    "맛있고 신선한 음료입니다. 최고급 원두로 만든 특별한 맛을 경험해보세요."
  );
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
        {getProductDescription(product.productName)}
      </p>

      {/* Quantity Selector */}
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
    </div>
  );
}
