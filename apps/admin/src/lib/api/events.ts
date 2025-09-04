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

export interface ReorderEventsResponse {
  message: string;
  updatedCount: number;
  newOrder: string[];
}

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

  // ✅ 개별 수정 (PUT /admin/events/{eventId})
  editEvent: async (
    eventId: string,
    payload: Partial<
      Pick<
        EventItem,
        | "title"
        | "description"
        | "eventImg"
        | "startDate"
        | "endDate"
        | "isActive"
        | "eventOrder"
      >
    >
  ): Promise<EventItem> => {
    const fd = new FormData();
    if (payload.title !== undefined) fd.append("title", payload.title);
    if (payload.description !== undefined)
      fd.append("description", payload.description);
    if (payload.eventImg !== undefined)
      fd.append("eventImg", payload.eventImg as any); // 필요 시 File 로만 사용
    if (payload.startDate !== undefined)
      fd.append("startDate", payload.startDate);
    if (payload.endDate !== undefined) fd.append("endDate", payload.endDate);
    if (payload.isActive !== undefined)
      fd.append("isActive", String(payload.isActive));
    if (payload.eventOrder !== undefined)
      fd.append("eventOrder", String(payload.eventOrder));

    const { data } = await axiosInstance.put(`/admin/events/${eventId}`, fd);
    return data as EventItem;
  },

  // 배치 재정렬
  reorderEvents: async (eventIds: string[]): Promise<ReorderEventsResponse> => {
    const { data } = await axiosInstance.post<ReorderEventsResponse>(
      "/admin/events/reorder",
      { eventIds }, // 문서 스펙 그대로 사용
      { headers: { "Content-Type": "application/json" } }
    );
    return data;
  },

  // 모든 이벤트 조회 (GET /events)
  getAll: async (params?: GetEventsParams): Promise<GetEventsResponse> => {
    const response = await axiosInstance.get("/events", { params });
    return response.data;
  },
};
