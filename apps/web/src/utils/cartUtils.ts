import { CartItem, CartSummary, CartResponse } from "@/types/cart";

/**
 * 장바구니 관련 유틸리티 함수들
 * 장바구니 데이터 처리와 계산을 위한 순수 함수들
 */

/**
 * 장바구니 아이템 배열로부터 요약 정보를 계산합니다.
 */
export const calculateSummary = (cart: CartItem[]): CartSummary => {
  return {
    totalAmount: cart.reduce((sum, item) => sum + item.subtotal, 0),
    totalItems: cart.reduce((sum, item) => sum + item.quantity, 0),
    itemCount: cart.length,
    availableItems: cart.filter((item) => item.isAvailable).length,
    outOfStockItems: cart.filter((item) => !item.isAvailable).length,
  };
};

/**
 * 장바구니 아이템의 수량을 업데이트합니다.
 */
export const updateCartItem = (
  cart: CartItem[],
  itemId: string,
  quantity: number
): CartItem[] => {
  return cart.map((item) =>
    item._id === itemId
      ? { ...item, quantity, subtotal: item.product.price * quantity }
      : item
  );
};

/**
 * 장바구니에서 아이템을 제거합니다.
 */
export const removeCartItem = (
  cart: CartItem[],
  itemId: string
): CartItem[] => {
  return cart.filter((item) => item._id !== itemId);
};

/**
 * 장바구니 아이템을 추가합니다.
 */
export const addCartItem = (
  cart: CartItem[],
  newItem: CartItem
): CartItem[] => {
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
};

/**
 * 전체 CartResponse를 업데이트합니다.
 */
export const updateCartResponse = (
  cartResponse: CartResponse,
  updatedCart: CartItem[]
): CartResponse => {
  return {
    ...cartResponse,
    cart: updatedCart,
    summary: calculateSummary(updatedCart),
  };
};

/**
 * 아이템 제거 후 CartResponse를 업데이트합니다.
 */
export const removeItemFromCart = (
  cartResponse: CartResponse,
  itemId: string
): CartResponse => {
  const updatedCart = removeCartItem(cartResponse.cart, itemId);
  return updateCartResponse(cartResponse, updatedCart);
};

/**
 * 아이템 수량 변경 후 CartResponse를 업데이트합니다.
 */
export const updateItemQuantity = (
  cartResponse: CartResponse,
  itemId: string,
  quantity: number
): CartResponse => {
  const updatedCart = updateCartItem(cartResponse.cart, itemId, quantity);
  return updateCartResponse(cartResponse, updatedCart);
};

/**
 * 장바구니 아이템의 가용성을 확인합니다.
 */
export const checkItemAvailability = (item: CartItem): boolean => {
  return item.isAvailable && item.quantity > 0;
};

/**
 * 장바구니에서 사용 가능한 아이템만 필터링합니다.
 */
export const filterAvailableItems = (cart: CartItem[]): CartItem[] => {
  return cart.filter(checkItemAvailability);
};

/**
 * 장바구니에서 품절된 아이템만 필터링합니다.
 */
export const filterOutOfStockItems = (cart: CartItem[]): CartItem[] => {
  return cart.filter((item) => !item.isAvailable);
};

/**
 * 장바구니 아이템을 상품 ID로 찾습니다.
 */
export const findCartItemById = (
  cart: CartItem[],
  itemId: string
): CartItem | undefined => {
  return cart.find((item) => item._id === itemId);
};

/**
 * 장바구니 아이템을 상품 ID로 찾습니다.
 */
export const findCartItemByProductId = (
  cart: CartItem[],
  productId: string
): CartItem | undefined => {
  return cart.find((item) => item.productId === productId);
};

/**
 * 장바구니가 비어있는지 확인합니다.
 */
export const isCartEmpty = (cart: CartItem[]): boolean => {
  return cart.length === 0;
};

/**
 * 장바구니의 총 금액이 최소 주문 금액을 만족하는지 확인합니다.
 */
export const isMinimumOrderMet = (
  cart: CartItem[],
  minimumAmount: number = 0
): boolean => {
  const summary = calculateSummary(cart);
  return summary.totalAmount >= minimumAmount;
};

/**
 * 장바구니 아이템의 수량을 증가시킵니다.
 */
export const increaseItemQuantity = (
  cart: CartItem[],
  itemId: string,
  increment: number = 1
): CartItem[] => {
  return cart.map((item) =>
    item._id === itemId
      ? {
          ...item,
          quantity: item.quantity + increment,
          subtotal: item.product.price * (item.quantity + increment),
        }
      : item
  );
};

/**
 * 장바구니 아이템의 수량을 감소시킵니다.
 */
export const decreaseItemQuantity = (
  cart: CartItem[],
  itemId: string,
  decrement: number = 1
): CartItem[] => {
  return cart.map((item) => {
    if (item._id === itemId) {
      const newQuantity = Math.max(0, item.quantity - decrement);
      return {
        ...item,
        quantity: newQuantity,
        subtotal: item.product.price * newQuantity,
      };
    }
    return item;
  });
};

/**
 * 장바구니에서 수량이 0인 아이템들을 제거합니다.
 */
export const removeZeroQuantityItems = (cart: CartItem[]): CartItem[] => {
  return cart.filter((item) => item.quantity > 0);
};

/**
 * 장바구니 아이템들을 카테고리별로 그룹화합니다.
 */
export const groupCartItemsByCategory = (
  cart: CartItem[]
): Record<string, CartItem[]> => {
  return cart.reduce(
    (groups, item) => {
      const category = item.product.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    },
    {} as Record<string, CartItem[]>
  );
};

/**
 * 장바구니 아이템들을 가격순으로 정렬합니다.
 */
export const sortCartItemsByPrice = (
  cart: CartItem[],
  order: "asc" | "desc" = "asc"
): CartItem[] => {
  return [...cart].sort((a, b) => {
    const comparison = a.product.price - b.product.price;
    return order === "asc" ? comparison : -comparison;
  });
};

/**
 * 장바구니 아이템들을 이름순으로 정렬합니다.
 */
export const sortCartItemsByName = (
  cart: CartItem[],
  order: "asc" | "desc" = "asc"
): CartItem[] => {
  return [...cart].sort((a, b) => {
    const comparison = a.product.productName.localeCompare(
      b.product.productName
    );
    return order === "asc" ? comparison : -comparison;
  });
};
