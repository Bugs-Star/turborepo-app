import axiosInstance from "@/lib/api/axios";

export interface Customer {
  name: string;
  email: string;
  createdAt: string; // ISO
}

export interface UsersSummary {
  totalUsers: number;
  totalUsersGrowthRate: number; // 전달 대비 증감률(%)
  newUsersThisMonth: number;
  newUsersGrowthRate: number; // 전달 대비 증감률(%)
}

export interface UsersPagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetAllCustomersResponse {
  summary: UsersSummary;
  users: Customer[];
  pagination: UsersPagination;
}

export interface PurchaseLine {
  productName: string;
  quantity: number;
  price: number; // 개당 가격(원)
}

export interface Purchase {
  orderId: string;
  orderDate: string; // ISO
  totalAmount: number; // 총액(원)
  itemsCount: number; // 아이템 개수
  lines?: PurchaseLine[]; // 선택
}

export interface PurchasesPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetRecentPurchasesResponse {
  purchases: Purchase[];
  pagination: PurchasesPagination;
}

export const CustomerService = {
  getAll: async (page = 1, limit = 15): Promise<GetAllCustomersResponse> => {
    const { data } = await axiosInstance.get<GetAllCustomersResponse>(
      "/admin/users",
      { params: { page, limit } } // ← 쿼리 파라미터 안전하게
    );
    return data;
  },

  getRecentPurchases: async (
    userId: string,
    page = 1,
    limit = 10
  ): Promise<GetRecentPurchasesResponse> => {
    const { data } = await axiosInstance.get<GetRecentPurchasesResponse>(
      `/admin/users/purchases/${userId}`,
      { params: { page, limit } }
    );
    return data;
  },
};
