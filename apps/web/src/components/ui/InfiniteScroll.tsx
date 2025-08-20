"use client";

import { useEffect, useRef, useCallback } from "react";

interface InfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  children: React.ReactNode;
  threshold?: number; // 0.0 ~ 1.0, 1.0은 완전히 보일 때
  rootMargin?: string; // "10px" 같은 CSS margin 값
}

export default function InfiniteScroll({
  onLoadMore,
  hasMore,
  loading,
  children,
  threshold = 0.1,
  rootMargin = "100px",
}: InfiniteScrollProps) {
  const observerRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore]
  );

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin,
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [handleObserver, threshold, rootMargin]);

  return (
    <div>
      {children}

      {/* 무한 스크롤 트리거 요소 */}
      {hasMore && (
        <div
          ref={observerRef}
          className="flex justify-center items-center py-4"
        >
          {loading && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
              <span className="text-sm text-gray-500">
                더 많은 상품을 불러오는 중...
              </span>
            </div>
          )}
        </div>
      )}

      {/* 모든 상품을 로드했을 때 */}
      {!hasMore && !loading && (
        <div className="flex justify-center items-center py-8">
          <span className="text-sm text-gray-400">
            모든 상품을 불러왔습니다.
          </span>
        </div>
      )}
    </div>
  );
}
