import { api } from "./api";

// 타입 정의
export interface User {
  _id: string;
  name: string;
  email: string;
  profileImg?: string;
}

// Product 타입을 새로운 타입 시스템에서 import
import type { Product } from "@/types/product";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  _id?: string;
}

// ProductsResponse 타입을 새로운 타입 시스템에서 import
import type { ProductsResponse } from "@/types/product";

// 타입들을 re-export
export type { Product, ProductsResponse };

// 인증 관련 API
export const authService = {
  // 로그인
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response;
  },

  // 회원가입
  signup: async (userData: SignupRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", userData);
    return response;
  },

  // 로그아웃
  logout: async () => {
    try {
      // 서버에 로그아웃 요청 (리프레시 토큰 무효화)
      // Zustand store에서 refreshToken을 가져와서 사용
      const { useAuthStore } = await import("@/stores/authStore");
      const refreshToken = useAuthStore.getState().tokens.refreshToken;

      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.error("로그아웃 요청 실패:", error);
    }
  },

  // 토큰 갱신
  refreshTokens: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/refresh", {
      refreshToken,
    });
    return response;
  },

  // 현재 사용자 정보 조회
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<{ user: User }>("/auth/profile");
    return response.user;
  },
};

// 상품 관련 API
export const productService = {
  // 전체 상품 목록 조회
  getProducts: async (params?: {
    category?: string;
    isRecommended?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ProductsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.isRecommended !== undefined)
      queryParams.append("isRecommended", params.isRecommended.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const url = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return await api.get<ProductsResponse>(url);
  },

  // 특정 상품 조회
  getProduct: async (id: string): Promise<{ product: Product }> => {
    return await api.get<{ product: Product }>(`/products/${id}`);
  },

  // 추천 상품 목록 조회
  getRecommendedProducts: async (): Promise<{ products: Product[] }> => {
    return await api.get<{ products: Product[] }>(
      "/products?isRecommended=true"
    );
  },

  // 카테고리별 상품 조회
  getProductsByCategory: async (
    category: string
  ): Promise<ProductsResponse> => {
    return await productService.getProducts({ category });
  },
};

// 사용자 관련 API
export const userService = {
  // 사용자 프로필 조회
  getProfile: async (): Promise<User> => {
    const response = await api.get<{ user: User }>("/auth/profile");
    return response.user;
  },

  // 사용자 프로필 수정
  updateProfile: async (formData: FormData): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(
      "/auth/profile",
      formData
    );
    return response;
  },

  // 비밀번호 변경
  changePassword: async (passwords: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    return await api.put<{ message: string }>("/auth/profile", {
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    });
  },
};

// 장바구니 관련 API (향후 구현 예정)
export const cartService = {
  // 장바구니 조회
  getCart: async () => {
    return await api.get("/cart");
  },

  // 장바구니 개수 조회
  getCartCount: async () => {
    return await api.get("/cart/count");
  },

  // 장바구니에 상품 추가
  addToCart: async (productId: string, quantity: number = 1) => {
    return await api.post("/cart/add", { productId, quantity });
  },

  // 장바구니에서 상품 제거
  removeFromCart: async (itemId: string) => {
    return await api.delete(`/cart/${itemId}`);
  },

  // 장바구니 상품 수량 변경
  updateCartItemQuantity: async (itemId: string, quantity: number) => {
    return await api.put(`/cart/${itemId}`, { quantity });
  },
};

// 주문 관련 API
export const orderService = {
  // 주문 내역 조회
  getOrderHistory: async (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const url = `/order${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return await api.get(url);
  },

  // 주문 생성
  createOrder: async (orderData: { paymentMethod: string }) => {
    return await api.post("/order", orderData);
  },

  // 주문 상세 조회
  getOrderDetail: async (orderId: string) => {
    return await api.get(`/order/${orderId}`);
  },
};

// 프로모션 관련 API
export interface Promotion {
  _id: string;
  title: string;
  description: string;
  promotionImg: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  position: "up" | "down";
  promotionOrder: number; // 프로모션 표시 순서 (작은 숫자가 위쪽에 표시)
  createdAt: string;
  updatedAt: string;
}

export interface PromotionsResponse {
  promotions: Promotion[];
}

export const promotionService = {
  // 전체 프로모션 목록 조회
  getPromotions: async (params?: {
    isActive?: boolean;
    position?: "up" | "down";
  }): Promise<PromotionsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());
    if (params?.position) queryParams.append("position", params.position);

    const url = `/promotions${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return await api.get<PromotionsResponse>(url);
  },

  // 특정 프로모션 조회
  getPromotion: async (id: string): Promise<{ promotion: Promotion }> => {
    return await api.get<{ promotion: Promotion }>(`/promotions/${id}`);
  },

  // 활성화된 프로모션만 조회
  getActivePromotions: async (): Promise<PromotionsResponse> => {
    return await promotionService.getPromotions({ isActive: true });
  },

  // 위치별 프로모션 조회
  getPromotionsByPosition: async (
    position: "up" | "down"
  ): Promise<PromotionsResponse> => {
    return await promotionService.getPromotions({ position, isActive: true });
  },
};

// 이벤트 관련 API
export interface Event {
  _id: string;
  title: string;
  description: string;
  eventImg: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  eventOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventsResponse {
  events: Event[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface EventResponse {
  event: Event;
}

export const eventService = {
  // 전체 이벤트 목록 조회
  getEvents: async (params?: {
    isActive?: boolean;
    current?: boolean;
    page?: number;
    limit?: number;
  }): Promise<EventsResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.isActive !== undefined) {
      queryParams.append("isActive", params.isActive.toString());
    }
    if (params?.current !== undefined) {
      queryParams.append("current", params.current.toString());
    }
    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }

    const url = `/events${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return await api.get(url);
  },

  // 특정 이벤트 조회
  getEvent: async (id: string): Promise<EventResponse> => {
    return await api.get(`/events/${id}`);
  },
};
