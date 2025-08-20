// API 응답 타입 (서버에서 오는 실제 데이터 구조)
export interface CartItem {
  _id: string;
  productId: string;
  quantity: number;
  product: {
    _id: string;
    productName: string;
    productImg: string;
    price: number;
    category: string;
  };
  subtotal: number;
  isAvailable: boolean;
  stockStatus: string;
}

export interface CartSummary {
  totalAmount: number;
  totalItems: number;
  itemCount: number;
  availableItems: number;
  outOfStockItems: number;
}

export interface CartResponse {
  cart: CartItem[];
  summary: CartSummary;
}

// UI 컴포넌트에서 사용하는 타입 (변환된 데이터 구조)
export interface CartItemUI {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

// 타입 변환 함수
export const transformCartItemForUI = (item: CartItem): CartItemUI => ({
  id: item._id,
  name: item.product.productName,
  price: item.product.price,
  quantity: item.quantity,
  imageUrl: item.product.productImg,
});

export const transformCartForUI = (cartResponse: CartResponse) => ({
  cart: cartResponse.cart.map(transformCartItemForUI),
  summary: cartResponse.summary,
});
