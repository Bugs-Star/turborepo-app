import axiosInstance from "@/lib/api/axios";

export interface Customer {
  name: string;
  email: string;
  createdAt: string;
}

export interface GetAllCustomersResponse {
  summary: {
    totalUsers: number;
    newUsersThisMonth: number;
  };
  users: Customer[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const CustomerService = {
  getAll: async (page = 1, limit = 15): Promise<GetAllCustomersResponse> => {
    const response = await axiosInstance.get<GetAllCustomersResponse>(
      `/admin/users?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};
