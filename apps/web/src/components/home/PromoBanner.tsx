"use client";

interface PromoBannerProps {
  title: string;
  subtitle: string;
  buttonText: string;
  imageUrl?: string;
  onButtonClick?: () => void;
}

export default function PromoBanner({
  title,
  subtitle,
  buttonText,
  imageUrl,
  onButtonClick,
}: PromoBannerProps) {
  return (
    <div className="mx-6 mb-6 mt-6 rounded-2xl p-6 relative overflow-hidden">
      {/* 배경 이미지 레이어 */}
      {imageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{
            backgroundImage: `url(${imageUrl})`,
          }}
        />
      )}

      {/* 콘텐츠 */}
      <div className="relative z-10">
        <div className="flex-1 pr-4">
          <h2 className="text-xl font-bold text-black mb-2">{title}</h2>
          <p className="text-sm text-black mb-4 leading-relaxed">{subtitle}</p>
          <button
            onClick={onButtonClick}
            className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
