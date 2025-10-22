// lib/api/events.ts
import axiosInstance from "./axios";

/** ----- Types ----- */
export interface EventItem {
  _id: string;
  title: string;
  description: string;
  eventImg: string; // 이미지 URL
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
  startDate: string;
  endDate: string;
  isActive: boolean;
  eventOrder: number;
}

/** 수정 요청 타입: File | string 허용(string은 URL로 간주, 전송 안 함) */
export type EditEventRequest = Partial<
  Pick<
    EventItem,
    | "title"
    | "description"
    | "startDate"
    | "endDate"
    | "isActive"
    | "eventOrder"
  >
> & {
  eventImg?: File | string;
};

export interface ReorderUpdate {
  id: string;
  order: number;
}

export interface ReorderEventsResponse {
  message: string;
  updatedCount: number;
  newOrder: string[];
}

export const EventsService = {
  addEvent: async (payload: AddEventPayload): Promise<EventItem> => {
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

  editEvent: async (
    eventId: string,
    payload: EditEventRequest
  ): Promise<EventItem> => {
    const fd = new FormData();

    if (payload.title !== undefined) fd.append("title", payload.title);
    if (payload.description !== undefined)
      fd.append("description", payload.description);

    if (payload.eventImg instanceof File) {
      fd.append("eventImg", payload.eventImg);
    }

    if (payload.startDate !== undefined)
      fd.append("startDate", payload.startDate);
    if (payload.endDate !== undefined) fd.append("endDate", payload.endDate);
    if (payload.isActive !== undefined)
      fd.append("isActive", payload.isActive ? "true" : "false");
    if (payload.eventOrder !== undefined)
      fd.append("eventOrder", String(payload.eventOrder));

    const { data } = await axiosInstance.put(`/admin/events/${eventId}`, fd);
    return data as EventItem;
  },

  reorderEvents: async (eventIds: string[]): Promise<ReorderEventsResponse> => {
    const { data } = await axiosInstance.post<ReorderEventsResponse>(
      "/admin/events/reorder",
      { eventIds }
    );
    return data;
  },

  deleteEvent: async (eventId: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete(`/admin/events/${eventId}`);
    return data as { message: string };
  },

  getAll: async (params?: GetEventsParams): Promise<GetEventsResponse> => {
    const { data } = await axiosInstance.get("/events", { params });
    return data as GetEventsResponse;
  },
};
