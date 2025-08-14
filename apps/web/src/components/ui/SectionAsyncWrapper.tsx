import { ReactNode } from "react";

interface SectionAsyncWrapperProps {
  loading: boolean;
  error: string | null;
  children: ReactNode;
  title: string;
  loadingMessage?: string;
  errorMessage?: string;
}

export default function SectionAsyncWrapper({
  loading,
  error,
  children,
  title,
  loadingMessage = "로딩 중...",
  errorMessage = "데이터를 불러올 수 없습니다.",
}: SectionAsyncWrapperProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 px-6 mb-4">{title}</h2>

      {loading && (
        <div className="px-6 text-center text-gray-500">{loadingMessage}</div>
      )}

      {error && (
        <div className="px-6 text-center text-red-500">
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-1">{errorMessage}</p>
        </div>
      )}

      {!loading && !error && children}
    </div>
  );
}
