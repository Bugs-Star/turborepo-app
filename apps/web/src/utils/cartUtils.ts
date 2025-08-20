import { CartItem, CartSummary, CartResponse } from "@/types/cart";

export class CartUtils {
  /**
   * 장바구니 아이템 배열로부터 요약 정보를 계산합니다.
   */
  static calculateSummary(cart: CartItem[]): CartSummary {
    return {
      totalAmount: cart.reduce((sum, item) => sum + item.subtotal, 0),
      totalItems: cart.reduce((sum, item) => sum + item.quantity, 0),
      itemCount: cart.length,
      availableItems: cart.filter((item) => item.isAvailable).length,
      outOfStockItems: cart.filter((item) => !item.isAvailable).length,
    };
  }

  /**
   * 장바구니 아이템의 수량을 업데이트합니다.
   */
  static updateCartItem(
    cart: CartItem[],
    itemId: string,
    quantity: number
  ): CartItem[] {
    return cart.map((item) =>
      item._id === itemId
        ? { ...item, quantity, subtotal: item.product.price * quantity }
        : item
    );
  }

  /**
   * 장바구니에서 아이템을 제거합니다.
   */
  static removeCartItem(cart: CartItem[], itemId: string): CartItem[] {
    return cart.filter((item) => item._id !== itemId);
  }

  /**
   * 장바구니 아이템을 추가합니다.
   */
  static addCartItem(cart: CartItem[], newItem: CartItem): CartItem[] {
    // 이미 존재하는 상품인지 확인
    const existingItemIndex = cart.findIndex(
      (item) => item.productId === newItem.productId
    );

    if (existingItemIndex > -1) {
      // 기존 아이템 수량 증가
      return cart.map((item, index) =>
        index === existingItemIndex
          ? {
              ...item,
              quantity: item.quantity + newItem.quantity,
              subtotal: item.product.price * (item.quantity + newItem.quantity),
            }
          : item
      );
    } else {
      // 새 아이템 추가
      return [...cart, newItem];
    }
  }

  /**
   * 전체 CartResponse를 업데이트합니다.
   */
  static updateCartResponse(
    cartResponse: CartResponse,
    updatedCart: CartItem[]
  ): CartResponse {
    return {
      ...cartResponse,
      cart: updatedCart,
      summary: this.calculateSummary(updatedCart),
    };
  }

  /**
   * 아이템 제거 후 CartResponse를 업데이트합니다.
   */
  static removeItemFromCart(
    cartResponse: CartResponse,
    itemId: string
  ): CartResponse {
    const updatedCart = this.removeCartItem(cartResponse.cart, itemId);
    return this.updateCartResponse(cartResponse, updatedCart);
  }

  /**
   * 아이템 수량 변경 후 CartResponse를 업데이트합니다.
   */
  static updateItemQuantity(
    cartResponse: CartResponse,
    itemId: string,
    quantity: number
  ): CartResponse {
    const updatedCart = this.updateCartItem(
      cartResponse.cart,
      itemId,
      quantity
    );
    return this.updateCartResponse(cartResponse, updatedCart);
  }
}
