import { ReactNode } from "react";

interface SectionAsyncWrapperProps {
  loading: boolean;
  error: string | null;
  children: ReactNode;
  title: string;
  loadingMessage?: string;
  errorMessage?: string;
  skeleton?: ReactNode; // 스켈레톤 컴포넌트 추가
}

export default function SectionAsyncWrapper({
  loading,
  error,
  children,
  title,
  loadingMessage = "로딩 중...",
  errorMessage = "데이터를 불러올 수 없습니다.",
  skeleton,
}: SectionAsyncWrapperProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>

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
