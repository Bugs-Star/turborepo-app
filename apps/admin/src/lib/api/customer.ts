import axiosInstance from "@/lib/api/axios";

export interface Customer {
  userId: string;
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
  productImg?: string;
  quantity: number;
  price: number; // 개당 가격(원)
}

export interface Order {
  orderNumber: string;
  orderDate: string; // from createdAt
  totalAmount: number; // from totalPrice
  itemsCount: number; // sum(items[].quantity)
  lines?: PurchaseLine[]; // mapped from items
}

export interface PurchasesPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetRecentPurchasesResponse {
  orders: Order[];
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
    type RawItem = {
      productId?:
        | { productName?: string; price?: number; productImg: string }
        | string;
      productName?: string;
      productImg?: string;
      price?: number;
      quantity?: number;
    };

    type RawOrder = {
      _id: string;
      orderNumber?: string;
      items?: RawItem[];
      totalPrice: number;
      paymentMethod: string;
      createdAt: string;
    };

    type RawResponse = {
      userId: { _id: string; name: string; email: string };
      orders: RawOrder[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalOrders: number;
      };
    };

    const { data } = await axiosInstance.get<RawResponse>(
      `/admin/order/${encodeURIComponent(userId)}`,
      { params: { page, limit } }
    );

    const orders: Order[] = (data.orders ?? []).map((o) => {
      const items = Array.isArray(o.items) ? o.items : [];
      const itemsCount = items.reduce(
        (sum, it) => sum + (it?.quantity ?? 0),
        0
      );

      const lines: PurchaseLine[] = items.map((it) => ({
        productName:
          (typeof it.productId === "object" && it.productId?.productName) ||
          it.productName ||
          "",
        productImg:
          (typeof it.productId === "object" && it.productId?.productImg) || "",
        quantity: it.quantity ?? 0,
        price:
          (typeof it.productId === "object" && it.productId?.price) ||
          it.price ||
          0,
      }));

      return {
        orderNumber: o.orderNumber ?? o._id,
        orderDate: o.createdAt,
        totalAmount: o.totalPrice,
        itemsCount,
        lines,
      };
    });

    const cur = data.pagination?.currentPage ?? page;
    const tot = data.pagination?.totalPages ?? 1;

    const pagination: PurchasesPagination = {
      currentPage: cur,
      totalPages: tot,
      totalItems: data.pagination?.totalOrders ?? orders.length,
      hasPrevPage: cur > 1,
      hasNextPage: cur < tot,
    };

    return { orders, pagination };
  },
};
