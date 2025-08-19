interface ProductImageProps {
  src: string;
  alt: string;
}

export default function ProductImage({ src, alt }: ProductImageProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3E이미지%3C/text%3E%3C/svg%3E";
  };

  return (
    <div className="relative w-full h-80 bg-gray-100">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={handleImageError}
      />
      {/* 그라데이션 오버레이 요소 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.1) 20%, rgba(255, 255, 255, 0.3) 40%, rgba(255, 255, 255, 0.7) 70%, rgba(255, 255, 255, 1) 100%)",
        }}
      ></div>
    </div>
  );
}
