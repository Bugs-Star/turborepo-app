"use client";

import { Button } from "@repo/ui";

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
    <div className="mb-4 mt-2 rounded-lg p-8 relative overflow-hidden">
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
          <p className="text-sm text-black mb-4 leading-relaxed line-clamp-1 overflow-hidden text-ellipsis">
            {subtitle}
          </p>
          <Button onClick={onButtonClick} variant="white" size="sm">
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
