import Image from "next/image";
import { Product } from "@/lib";
import { useRouter } from "next/navigation";
import {
  createImageErrorHandler,
  formatPrice,
  getProductStatus,
} from "@/utils";

// 개별 상품 카드 컴포넌트
interface ProductCardProps {
  product: Product;
  activeCategory: string;
  onProductClick?: (product: Product, activeCategory: string) => void;
}

function ProductCard({
  product,
  activeCategory,
  onProductClick,
}: ProductCardProps) {
  const router = useRouter();
  const productStatus = getProductStatus(product);
  const isOutOfStock = productStatus.isOutOfStock;

  const handleImageError = createImageErrorHandler();

  const handleCardClick = () => {
    // 로거 콜백 호출 (있는 경우)
    onProductClick?.(product, activeCategory);

    // 기존 네비게이션 로직
    router.push(`/menu/${product._id}?category=${activeCategory}`);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200 relative"
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        <Image
          src={product.productImg}
          alt={product.productName}
          fill
          className="object-cover"
          onError={handleImageError}
        />
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3 className="text-sm font-bold text-black mb-1 truncate">
          {product.productName}
        </h3>
        <p className="text-sm font-semibold text-green-700">
          {formatPrice(product.price)}
        </p>
      </div>

      {/* 투명한 오버레이 - 재고가 없을 때만 카드 전체를 덮음 */}
      {isOutOfStock && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="text-lg font-bold text-black">SOLD OUT</div>
        </div>
      )}
    </div>
  );
}

// 상품 그리드 컴포넌트
interface ProductGridProps {
  products: Product[];
  activeCategory: string;
  onProductClick?: (product: Product, activeCategory: string) => void;
}

export default function ProductGrid({
  products,
  activeCategory,
  onProductClick,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-gray-400 text-center">
          <p className="text-sm mb-2">해당 카테고리의 상품이 없습니다.</p>
          <p className="text-xs">다른 카테고리를 선택해보세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          activeCategory={activeCategory}
          onProductClick={onProductClick}
        />
      ))}
    </div>
  );
}
