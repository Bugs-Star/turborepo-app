import { QueryClient } from "@tanstack/react-query";
import { CartResponse } from "@/types/cart";
import { CartCountResponse } from "@/hooks/useCartCountFetch";

export class CacheUtils {
  /**
   * cart 캐시와 cartCount 캐시를 동시에 업데이트합니다.
   */
  static updateBothCaches(
    queryClient: QueryClient,
    cartUpdater: (oldData: CartResponse | undefined) => CartResponse | undefined
  ) {
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
  }

  /**
   * cart 데이터를 기반으로 cartCount 캐시를 동기화합니다.
   */
  static synchronizeCartCount(queryClient: QueryClient) {
    const cartData = queryClient.getQueryData<CartResponse>(["cart"]);
    if (cartData) {
      queryClient.setQueryData<CartCountResponse>(["cartCount"], {
        count: cartData.summary.totalItems,
      });
    }
  }

  /**
   * 에러 발생 시 모든 장바구니 관련 캐시를 롤백합니다.
   */
  static rollbackAllCaches(
    queryClient: QueryClient,
    previousCart: CartResponse | undefined,
    previousCount: CartCountResponse | undefined
  ) {
    if (previousCart) {
      queryClient.setQueryData<CartResponse>(["cart"], previousCart);
    }
    if (previousCount) {
      queryClient.setQueryData<CartCountResponse>(["cartCount"], previousCount);
    }
  }

  /**
   * 현재 캐시 상태를 백업합니다.
   */
  static backupCacheState(queryClient: QueryClient) {
    return {
      cart: queryClient.getQueryData<CartResponse>(["cart"]),
      cartCount: queryClient.getQueryData<CartCountResponse>(["cartCount"]),
    };
  }

  /**
   * 장바구니 관련 모든 캐시를 무효화합니다.
   */
  static invalidateAllCartCaches(queryClient: QueryClient) {
    queryClient.invalidateQueries({ queryKey: ["cart"] });
    queryClient.invalidateQueries({ queryKey: ["cartCount"] });
  }
}
