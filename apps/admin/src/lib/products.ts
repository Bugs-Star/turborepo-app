import axiosInstance from "./axios";

export interface AddProductPayload {
  productCode: string;
  productName: string;
  productImg: File;
  productContents: string;
  category: "beverage" | "food" | "goods";
  price: number;
  currentStock?: number;
  optimalStock: number;
  isRecommended?: boolean;
  recommendedOrder?: number;
}

export interface ProductResponse {
  _id: string;
  productCode: string;
  productName: string;
  productImg: string; // base64
  productContents: string;
  category: "beverage" | "food" | "goods";
  price: number;
  currentStock: number;
  optimalStock: number;
  isRecommended: boolean;
  recommendedOrder: number;
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetProductsParams {
  category?: "beverage" | "food" | "goods";
  isRecommended?: boolean;
  page?: number;
  limit?: number;
}

export interface GetProductsResponse {
  products: ProductResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const ProductsService = {
  // 상품 추가
  addProduct: async (payload: AddProductPayload) => {
    const formData = new FormData();
    formData.append("productCode", payload.productCode);
    formData.append("productName", payload.productName);
    formData.append("productImg", payload.productImg);
    formData.append("productContents", payload.productContents);
    formData.append("category", payload.category);
    formData.append("price", payload.price.toString());
    formData.append("optimalStock", payload.optimalStock.toString());

    if (payload.currentStock !== undefined) {
      formData.append("currentStock", payload.currentStock.toString());
    }
    if (payload.isRecommended !== undefined) {
      formData.append(
        "isRecommended",
        payload.isRecommended ? "true" : "false"
      );
    }
    if (payload.recommendedOrder !== undefined) {
      formData.append("recommendedOrder", payload.recommendedOrder.toString());
    }

    const token = localStorage.getItem("accessToken");

    const response = await axiosInstance.post("/admin/products", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  // 모든 상품 조회
  getAll: async (params?: GetProductsParams): Promise<GetProductsResponse> => {
    const response = await axiosInstance.get("/products", { params });
    return response.data;
  },
};
