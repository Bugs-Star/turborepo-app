import axiosInstance from "./axios";

/* ---------- Types ---------- */
export interface AddPromoPayload {
  title: string;
  description: string;
  promotionImg: File;
  startDate: string; // ISO
  endDate: string; // ISO
}

export interface PromoResponse {
  _id: string;
  title: string;
  description: string;
  promotionImg: string;
  startDate: string; // ISO
  endDate: string; // ISO
  isActive: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  promotionOrder?: number;
}

export interface GetPromosParams {
  isActive?: boolean;
}

export interface GetPromosResponse {
  promotions: PromoResponse[];
}

export interface DeletePromoResponse {
  message?: string;
  success?: boolean;
}

export interface ReorderPromosResponse {
  message: string;
  updatedCount: number;
  newOrder: string[];
}

/** 서버 주간 포맷 */
export interface ViewTrendPoint {
  name: string; // "1주" ~ "5주"
  viewDuration: number; // 보통 초(예시 기준). 이미 분이면 훅에서 나누기 제거.
}
export interface ClickTrendPoint {
  name: string; // "1주" ~ "5주"
  clicks: number;
}

export interface WeeklyMeta {
  year: number;
  month: number;
  generatedAt: string; // ISO
}

export interface WeeklyPromoResponse {
  promotion: { _id: string; title: string };
  viewTrendData: ViewTrendPoint[];
  clickTrendData: ClickTrendPoint[];
  meta: WeeklyMeta;
}

export interface WeeklyPromoParams {
  promotionId: string;
  periodType?: "weekly"; // 고정 weekly (기본값)
  year: number; // 예: 2025
  month: number; // 예: 9
}

/* ---------- Service ---------- */
export const PromoService = {
  async getAll(params?: GetPromosParams): Promise<GetPromosResponse> {
    const { data } = await axiosInstance.get<GetPromosResponse>("/promotions", {
      params,
    });
    return data;
  },

  async addPromo(payload: AddPromoPayload): Promise<PromoResponse> {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("description", payload.description);
    formData.append("promotionImg", payload.promotionImg);
    formData.append("startDate", payload.startDate);
    formData.append("endDate", payload.endDate);

    const { data } = await axiosInstance.post<PromoResponse>(
      "/admin/promotions",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  async editPromo(
    promoId: string,
    payload: Partial<AddPromoPayload>
  ): Promise<PromoResponse> {
    const formData = new FormData();
    if (payload.title) formData.append("title", payload.title);
    if (payload.description)
      formData.append("description", payload.description);
    if (payload.promotionImg)
      formData.append("promotionImg", payload.promotionImg);
    if (payload.startDate) formData.append("startDate", payload.startDate);
    if (payload.endDate) formData.append("endDate", payload.endDate);

    const { data } = await axiosInstance.put<PromoResponse>(
      `/admin/promotions/${promoId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  async deletePromo(promoId: string): Promise<DeletePromoResponse> {
    const { data } = await axiosInstance.delete<DeletePromoResponse>(
      `/admin/promotions/${promoId}`
    );
    return data;
  },

  async reorderPromotions(
    promotionIds: string[]
  ): Promise<ReorderPromosResponse> {
    const { data } = await axiosInstance.post<ReorderPromosResponse>(
      "/admin/promotions/reorder",
      { promotionIds },
      { headers: { "Content-Type": "application/json" } }
    );
    return data;
  },

  async getPromoWeekly(
    params: WeeklyPromoParams
  ): Promise<WeeklyPromoResponse> {
    const { promotionId, year, month, periodType = "weekly" } = params;

    const { data } = await axiosInstance.get<WeeklyPromoResponse>(
      `/admin/promotions/${promotionId}/${periodType}`,
      { params: { year, month } }
    );
    return data;
  },
};
