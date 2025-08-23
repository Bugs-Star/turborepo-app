import axiosInstance from "./axios";

// types/events.ts
export interface EventItem {
  _id: string;
  title: string;
  description: string;
  eventImg: string;
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
  isActive?: boolean; // 활성 상태 필터
  page?: number; // 페이지 번호
  limit?: number; // 페이지당 항목 수
}

export const EventsService = {
  getAll: async (params?: GetEventsParams): Promise<GetEventsResponse> => {
    const response = await axiosInstance.get("/events", { params });
    return response.data;
  },
};
