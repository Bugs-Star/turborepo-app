"use client";

interface PromoBannerProps {
  title: string;
  subtitle: string;
  buttonText: string;
  bgColor?: string;
  imageUrl?: string;
  onButtonClick?: () => void;
}

export default function PromoBanner({
  title,
  subtitle,
  buttonText,
  bgColor = "bg-green-50",
  imageUrl,
  onButtonClick,
}: PromoBannerProps) {
  return (
    <div
      className={`mx-6 mb-6 mt-6 rounded-2xl ${bgColor} p-6 relative overflow-hidden`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            {subtitle}
          </p>
          <button
            onClick={onButtonClick}
            className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
          >
            {buttonText}
          </button>
        </div>
        {imageUrl && (
          <div className="flex-shrink-0">
            <img
              src={imageUrl}
              alt="Promotion"
              className="w-20 h-20 object-cover rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}
