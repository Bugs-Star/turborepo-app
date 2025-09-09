import { Product } from "@/types";
import { formatProductPrice } from "@/utils/productUtils";

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="py-6 mb-6">
      <h2 className="text-2xl font-bold text-black mb-2">
        {product.productName}
      </h2>
      <p className="text-xl font-semibold text-green-800 mb-4">
        {product.price.toLocaleString()}원
      </p>

      <p className="text-gray-600 text-sm leading-relaxed mb-6">
        {product.productContents}
      </p>
    </div>
  );
}
