import { ReactNode } from "react";

interface SectionAsyncWrapperProps {
  loading: boolean;
  error: string | null;
  children: ReactNode;
  title: string;
  subtitle?: string; // 부제목 추가
  loadingMessage?: string;
  errorMessage?: string;
  skeleton?: ReactNode; // 스켈레톤 컴포넌트 추가
}

export default function SectionAsyncWrapper({
  loading,
  error,
  children,
  title,
  subtitle,
  loadingMessage = "로딩 중...",
  errorMessage = "데이터를 불러올 수 없습니다.",
  skeleton,
}: SectionAsyncWrapperProps) {
  return (
    <div className="mb-6">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-gray-900 cursor-default">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-600 cursor-default">{subtitle}</p>
        )}
      </div>

      {loading &&
        (skeleton || (
          <div className="text-center text-gray-500">{loadingMessage}</div>
        ))}

      {error && (
        <div className="text-center text-red-500">
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-1">{errorMessage}</p>
        </div>
      )}

      {!loading && !error && children}
    </div>
  );
}
