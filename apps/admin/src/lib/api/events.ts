// lib/events.ts
import axiosInstance from "./axios";

/** ----- Types ----- */
export interface EventItem {
  _id: string;
  title: string;
  description: string;
  eventImg: string; // 서버가 반환하는 이미지 URL
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

/** 드래그 재정렬 커밋 포맷(프론트가 보내는 형태와 일치) */
export interface ReorderUpdate {
  id: string;
  order: number;
}

export interface ReorderEventsResponse {
  message: string;
  updatedCount: number;
  newOrder: string[]; // 서버가 id 배열 등으로 반환한다고 가정
}

export const EventsService = {
  /** 이벤트 추가 (POST /admin/events) */
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
    formData.append("eventOrder", String(payload.eventOrder));

    const { data } = await axiosInstance.post("/admin/events", formData);
    return data as EventItem;
  },

  /** 개별 수정 (PUT /admin/events/{eventId}) — multipart/form-data */
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

    // 이미지: 새 파일일 때만 전송(기존 URL 문자열은 무시)
    if (payload.eventImg !== undefined) {
      const maybeFile = payload.eventImg as unknown;
      if (maybeFile instanceof File) {
        fd.append("eventImg", maybeFile);
      }
      // string(URL) 이 들어온 경우에는 서버에 굳이 보내지 않음
    }

    if (payload.startDate !== undefined)
      fd.append("startDate", payload.startDate);
    if (payload.endDate !== undefined) fd.append("endDate", payload.endDate);

    if (payload.isActive !== undefined) {
      fd.append("isActive", payload.isActive ? "true" : "false");
    }
    if (payload.eventOrder !== undefined) {
      fd.append("eventOrder", String(payload.eventOrder));
    }

    const { data } = await axiosInstance.put(`/admin/events/${eventId}`, fd);
    return data as EventItem;
  },

  reorderEvents: async (
    updates: ReorderUpdate[]
  ): Promise<ReorderEventsResponse> => {
    const { data } = await axiosInstance.post<ReorderEventsResponse>(
      "/admin/events/reorder",
      { updates } // 예: [{ id: "...", order: 0 }, ...]
      // axios는 JSON에 자동으로 Content-Type 설정
    );
    return data;
  },

  /** 개별 삭제 (DELETE /admin/events/{eventId}) */
  deleteEvent: async (eventId: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete(`/admin/events/${eventId}`);
    return data as { message: string };
  },

  /** 모든 이벤트 조회 (GET /events) */
  getAll: async (params?: GetEventsParams): Promise<GetEventsResponse> => {
    const { data } = await axiosInstance.get("/events", { params });
    return data as GetEventsResponse;
  },
};
