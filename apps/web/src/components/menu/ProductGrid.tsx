import { Product } from "@/lib";

// 가격 포맷팅 함수
const formatPrice = (price: number) => {
  return price.toLocaleString() + "원";
};

// 개별 상품 카드 컴포넌트
interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3E이미지%3C/text%3E%3C/svg%3E";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        <img
          src={product.productImg}
          alt={product.productName}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-black mb-1 truncate">
          {product.productName}
        </h3>
        <p className="text-sm font-medium text-green-600">
          {formatPrice(product.price)}
        </p>
      </div>
    </div>
  );
}

// 상품 그리드 컴포넌트
interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
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
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
