import { QueryClient } from "@tanstack/react-query";
import { CartResponse } from "@/types/cart";
import { CartCountResponse } from "@/hooks/useCartCountFetch";

/**
 * 캐시 관련 유틸리티 함수들
 * React Query 캐시 관리를 위한 순수 함수들
 */

/**
 * cart 캐시와 cartCount 캐시를 동시에 업데이트합니다.
 */
export const updateBothCaches = (
  queryClient: QueryClient,
  cartUpdater: (oldData: CartResponse | undefined) => CartResponse | undefined
) => {
  // 1. cart 캐시 업데이트
  const updatedCart = queryClient.setQueryData<CartResponse>(
    ["cart"],
    cartUpdater
  );

  // 2. cartCount 캐시도 동시 업데이트
  if (updatedCart) {
    queryClient.setQueryData<CartCountResponse>(["cartCount"], {
      count: updatedCart.summary.totalItems,
    });
  }

  return updatedCart;
};

/**
 * cart 데이터를 기반으로 cartCount 캐시를 동기화합니다.
 */
export const synchronizeCartCount = (queryClient: QueryClient) => {
  const cartData = queryClient.getQueryData<CartResponse>(["cart"]);
  if (cartData) {
    queryClient.setQueryData<CartCountResponse>(["cartCount"], {
      count: cartData.summary.totalItems,
    });
  }
};

/**
 * 에러 발생 시 모든 장바구니 관련 캐시를 롤백합니다.
 */
export const rollbackAllCaches = (
  queryClient: QueryClient,
  previousCart: CartResponse | undefined,
  previousCount: CartCountResponse | undefined
) => {
  if (previousCart) {
    queryClient.setQueryData<CartResponse>(["cart"], previousCart);
  }
  if (previousCount) {
    queryClient.setQueryData<CartCountResponse>(["cartCount"], previousCount);
  }
};

/**
 * 현재 캐시 상태를 백업합니다.
 */
export const backupCacheState = (queryClient: QueryClient) => {
  return {
    cart: queryClient.getQueryData<CartResponse>(["cart"]),
    cartCount: queryClient.getQueryData<CartCountResponse>(["cartCount"]),
  };
};

/**
 * 장바구니 관련 모든 캐시를 무효화합니다.
 */
export const invalidateAllCartCaches = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ["cart"] });
  queryClient.invalidateQueries({ queryKey: ["cartCount"] });
};

/**
 * 특정 쿼리 키의 캐시를 무효화합니다.
 */
export const invalidateQuery = (
  queryClient: QueryClient,
  queryKey: string[]
) => {
  queryClient.invalidateQueries({ queryKey });
};

/**
 * 특정 쿼리 키의 캐시를 제거합니다.
 */
export const removeQuery = (queryClient: QueryClient, queryKey: string[]) => {
  queryClient.removeQueries({ queryKey });
};

/**
 * 캐시 데이터를 가져옵니다.
 */
export const getQueryData = <T>(
  queryClient: QueryClient,
  queryKey: string[]
): T | undefined => {
  return queryClient.getQueryData<T>(queryKey);
};

/**
 * 캐시 데이터를 설정합니다.
 */
export const setQueryData = <T>(
  queryClient: QueryClient,
  queryKey: string[],
  data: T
) => {
  return queryClient.setQueryData<T>(queryKey, data);
};

/**
 * 캐시 데이터를 업데이트합니다.
 */
export const updateQueryData = <T>(
  queryClient: QueryClient,
  queryKey: string[],
  updater: (oldData: T | undefined) => T | undefined
) => {
  return queryClient.setQueryData<T>(queryKey, updater);
};

/**
 * 모든 캐시를 무효화합니다.
 */
export const invalidateAllQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries();
};

/**
 * 특정 조건에 맞는 쿼리들을 무효화합니다.
 */
export const invalidateQueriesByPredicate = (
  queryClient: QueryClient,
  predicate: (query: unknown) => boolean
) => {
  queryClient.invalidateQueries({ predicate });
};

/**
 * 캐시 상태를 확인합니다.
 */
export const getQueryState = (queryClient: QueryClient, queryKey: string[]) => {
  return queryClient.getQueryState(queryKey);
};

/**
 * 캐시된 쿼리들의 목록을 가져옵니다.
 */
export const getQueryCache = (queryClient: QueryClient) => {
  return queryClient.getQueryCache();
};

/**
 * 캐시를 정리합니다 (가비지 컬렉션).
 */
export const garbageCollect = (queryClient: QueryClient) => {
  // React Query v5에서는 garbageCollect가 제거됨
  // 대신 removeQueries를 사용하여 사용하지 않는 쿼리 제거
  queryClient.removeQueries({
    predicate: (query) =>
      query.state.dataUpdatedAt < Date.now() - 30 * 60 * 1000, // 30분 이상 된 쿼리
  });
};

/**
 * 캐시 상태를 초기화합니다.
 */
export const resetQueries = (queryClient: QueryClient, queryKey?: string[]) => {
  if (queryKey) {
    queryClient.resetQueries({ queryKey });
  } else {
    queryClient.resetQueries();
  }
};

/**
 * 캐시 데이터를 안전하게 가져옵니다 (타입 안전).
 */
export const getQueryDataSafely = <T>(
  queryClient: QueryClient,
  queryKey: string[],
  defaultValue: T
): T => {
  const data = queryClient.getQueryData<T>(queryKey);
  return data !== undefined ? data : defaultValue;
};

/**
 * 캐시 데이터가 존재하는지 확인합니다.
 */
export const hasQueryData = (
  queryClient: QueryClient,
  queryKey: string[]
): boolean => {
  return queryClient.getQueryData(queryKey) !== undefined;
};

/**
 * 캐시 데이터의 타입을 확인합니다.
 */
export const isQueryDataOfType = (
  queryClient: QueryClient,
  queryKey: string[]
): boolean => {
  const data = queryClient.getQueryData(queryKey);
  return data !== undefined && typeof data === "object";
};
