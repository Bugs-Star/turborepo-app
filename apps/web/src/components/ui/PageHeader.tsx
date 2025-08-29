"use client";

import BackButton from "./BackButton";

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  className?: string;
  variant?: "default" | "greeting";
}

export default function PageHeader({
  title,
  showBackButton = true,
  onBackClick,
  className = "",
  variant = "default",
}: PageHeaderProps) {
  if (variant === "greeting") {
    return (
      <header
        className={`flex items-center px-4 py-3 border-b border-gray-200 ${className}`}
      >
        {showBackButton && (
          <div className="flex-shrink-0">
            <BackButton onClick={onBackClick} />
          </div>
        )}
        <h1 className="flex-1 text-center text-lg font-semibold text-gray-900">
          {title}
        </h1>
        {showBackButton && <div className="w-10 flex-shrink-0" />}
      </header>
    );
  }

  return (
    <header
      className={`flex items-center px-4 py-3 bg-white border-b border-gray-100 ${className}`}
    >
      {showBackButton && (
        <div className="flex-shrink-0">
          <BackButton onClick={onBackClick} />
        </div>
      )}
      <h1 className="flex-1 text-center text-lg font-semibold text-gray-900">
        {title}
      </h1>
      {/* 뒤로가기 버튼이 있을 때 오른쪽 공간을 맞추기 위한 더미 요소 */}
      {showBackButton && <div className="w-10 flex-shrink-0" />}
    </header>
  );
}
