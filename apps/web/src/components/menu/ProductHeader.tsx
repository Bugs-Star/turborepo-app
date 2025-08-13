interface ProductHeaderProps {
  productName: string;
}

export default function ProductHeader({ productName }: ProductHeaderProps) {
  return (
    <div className="text-center py-4 border-b border-gray-100">
      <h1 className="text-lg font-semibold text-black">{productName}</h1>
    </div>
  );
}
