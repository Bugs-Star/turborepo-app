"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  // QueryClient를 컴포넌트 내부에서 생성하여 직렬화 문제 해결
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 기본 설정
            staleTime: 5 * 60 * 1000, // 5분 (데이터가 fresh한 시간)
            gcTime: 10 * 60 * 1000, // 10분 (캐시 유지 시간)
            retry: 2, // 실패 시 2번 재시도
            refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 비활성화
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
