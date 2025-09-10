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

      <p className="text-gray-600 text-sm leading-relaxed mb-4">
        {product.productContents}
      </p>

      <p className="text-xl font-semibold text-green-800">
        {product.price.toLocaleString()}원
      </p>
    </div>
  );
}
