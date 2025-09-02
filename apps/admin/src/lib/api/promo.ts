import axiosInstance from "./axios";

// 광고 추가에 사용하는 payload
export interface AddPromoPayload {
  title: string;
  description: string;
  promotionImg: File;

  startDate: string; // ISO string
  endDate: string; // ISO string
}

// 광고 응답 데이터
export interface PromoResponse {
  _id: string;
  title: string;
  description: string;
  promotionImg: string; // URL 또는 data URL

  startDate: string; // ISO
  endDate: string; // ISO
  isActive: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

// 광고 조회 파라미터
export interface GetPromosParams {
  isActive?: boolean;
}

// 광고 조회 응답 (✅ 페이지네이션 제거)
export interface GetPromosResponse {
  promotions: PromoResponse[];
}

export interface DeletePromoResponse {
  message?: string;
  success?: boolean;
}

export const PromoService = {
  getAll: async (params?: GetPromosParams): Promise<GetPromosResponse> => {
    const { data } = await axiosInstance.get<GetPromosResponse>("/promotions", {
      params,
    });
    return data;
  },

  // 광고 추가
  addPromo: async (payload: AddPromoPayload): Promise<PromoResponse> => {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("description", payload.description);
    formData.append("promotionImg", payload.promotionImg);
    formData.append("startDate", payload.startDate);
    formData.append("endDate", payload.endDate);

    const response = await axiosInstance.post("/admin/promotions", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // 광고 수정
  editPromo: async (
    promoId: string,
    payload: Partial<AddPromoPayload>
  ): Promise<PromoResponse> => {
    const formData = new FormData();
    if (payload.title) formData.append("title", payload.title);
    if (payload.description)
      formData.append("description", payload.description);
    if (payload.promotionImg)
      formData.append("promotionImg", payload.promotionImg);
    if (payload.startDate) formData.append("startDate", payload.startDate);
    if (payload.endDate) formData.append("endDate", payload.endDate);

    const response = await axiosInstance.put(
      `/admin/promotions/${promoId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },

  // 광고 삭제
  deletePromo: async (promoId: string): Promise<DeletePromoResponse> => {
    const res = await axiosInstance.delete(`/admin/promotions/${promoId}`);
    return res.data;
  },
};
