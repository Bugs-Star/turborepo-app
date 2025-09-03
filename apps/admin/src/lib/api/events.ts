// lib/events.ts
import axiosInstance from "./axios";

/** ----- Types ----- */
export interface EventItem {
  _id: string;
  title: string;
  description: string;
  eventImg: string; // URL or base64 (서버 응답 기준)
  startDate: string;
  endDate: string;
  isActive: boolean;
  eventOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface GetEventsResponse {
  events: EventItem[];
  pagination: Pagination;
}

export interface GetEventsParams {
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface AddEventPayload {
  title: string;
  description: string;
  eventImg: File;
  startDate: string; // ISO string
  endDate: string; // ISO string
  isActive: boolean;
  eventOrder: number;
}

/** ----- Service ----- */
export const EventsService = {
  // 이벤트 추가 (POST /admin/events)
  addEvent: async (payload: AddEventPayload): Promise<EventItem> => {
    // 업로드 파일 로그 (디버깅용)
    console.log({
      name: payload.eventImg?.name,
      type: payload.eventImg?.type,
      size: payload.eventImg?.size,
    });

    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("description", payload.description);
    formData.append("eventImg", payload.eventImg);
    formData.append("startDate", payload.startDate);
    formData.append("endDate", payload.endDate);
    formData.append("isActive", payload.isActive ? "true" : "false");
    formData.append("eventOrder", payload.eventOrder.toString());

    const response = await axiosInstance.post("/admin/events", formData);
    return response.data;
  },

  // 모든 이벤트 조회 (GET /events)
  getAll: async (params?: GetEventsParams): Promise<GetEventsResponse> => {
    const response = await axiosInstance.get("/events", { params });
    return response.data;
  },
};
