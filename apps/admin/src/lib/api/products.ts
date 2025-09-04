import axiosInstance from "./axios";

// 상품 추가에 사용하는 payload
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
  productOrder?: number;
}

// 상품 응답 데이터
export interface ProductResponse {
  _id: string;
  productCode: string;
  productName: string;
  productImg: string; // base64 혹은 URL
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
  productOrder?: number;
}

// 상품 조회 파라미터
export interface GetProductsParams {
  category?: "beverage" | "food" | "goods";
  isRecommended?: boolean;
  page?: number;
  limit?: number;
}

// 상품 조회 응답
export interface GetProductsResponse {
  products: ProductResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface DeleteProductResponse {
  message?: string;
  success?: boolean;
}

// ✅ 추천메뉴 배치 재정렬 응답
export interface ReorderRecommendedResponse {
  message: string;
  updatedCount: number;
  newOrder: string[];
}

export const ProductsService = {
  // 상품 추가
  addProduct: async (payload: AddProductPayload): Promise<ProductResponse> => {
    console.log({
      name: payload.productImg?.name,
      type: payload.productImg?.type,
      size: payload.productImg?.size,
    });

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

    const response = await axiosInstance.post("/admin/products", formData);
    return response.data;
  },

  // 상품 수정 (파일 포함 시 사용)
  editProduct: async (
    productId: string,
    payload: Partial<AddProductPayload>
  ): Promise<ProductResponse> => {
    const formData = new FormData();

    if (payload.productCode)
      formData.append("productCode", payload.productCode);
    if (payload.productName)
      formData.append("productName", payload.productName);
    if (payload.productImg) formData.append("productImg", payload.productImg);
    if (payload.productContents)
      formData.append("productContents", payload.productContents);
    if (payload.category) formData.append("category", payload.category);
    if (payload.price !== undefined)
      formData.append("price", payload.price.toString());
    if (payload.optimalStock !== undefined)
      formData.append("optimalStock", payload.optimalStock.toString());
    if (payload.currentStock !== undefined)
      formData.append("currentStock", payload.currentStock.toString());
    if (payload.isRecommended !== undefined) {
      formData.append(
        "isRecommended",
        payload.isRecommended ? "true" : "false"
      );
    }
    if (payload.recommendedOrder !== undefined) {
      formData.append("recommendedOrder", payload.recommendedOrder.toString());
    }
    if (payload.productOrder !== undefined) {
      formData.append("productOrder", payload.productOrder.toString());
    }

    const response = await axiosInstance.put(
      `/admin/products/${productId}`,
      formData
    );
    return response.data;
  },

  // ✅ 파일 없이 숫자/불리언만 바꿀 때 JSON PUT (FormData 400 방지용)
  updateProductJson: async (
    productId: string,
    payload: Partial<AddProductPayload>
  ): Promise<ProductResponse> => {
    const body: any = {};
    if (payload.productCode !== undefined)
      body.productCode = payload.productCode;
    if (payload.productName !== undefined)
      body.productName = payload.productName;
    if (payload.productContents !== undefined)
      body.productContents = payload.productContents;
    if (payload.category !== undefined) body.category = payload.category;
    if (payload.price !== undefined) body.price = payload.price;
    if (payload.optimalStock !== undefined)
      body.optimalStock = payload.optimalStock;
    if (payload.currentStock !== undefined)
      body.currentStock = payload.currentStock;
    if (payload.isRecommended !== undefined)
      body.isRecommended = payload.isRecommended;
    if (payload.recommendedOrder !== undefined)
      body.recommendedOrder = payload.recommendedOrder;
    if (payload.productOrder !== undefined)
      body.productOrder = payload.productOrder;

    const { data } = await axiosInstance.put(
      `/admin/products/${productId}`,
      body,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return data;
  },

  // 상품 삭제
  deleteProduct: async (productId: string): Promise<DeleteProductResponse> => {
    const res = await axiosInstance.delete(`/admin/products/${productId}`);
    return res.data;
  },

  // 모든 상품 조회
  getAll: async (params?: GetProductsParams): Promise<GetProductsResponse> => {
    const response = await axiosInstance.get("/products", { params });
    return response.data;
  },

  // 추천메뉴 배치 재정렬(
  reorderRecommended: async (
    productIds: string[]
  ): Promise<ReorderRecommendedResponse> => {
    const { data } = await axiosInstance.post<ReorderRecommendedResponse>(
      "/admin/products/reorder-recommended",
      { productIds: productIds },
      { headers: { "Content-Type": "application/json" } }
    );
    return data;
  },
};
