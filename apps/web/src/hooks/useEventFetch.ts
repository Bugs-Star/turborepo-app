import { useState, useEffect } from "react";
import { eventService, Event } from "@/lib/services";

interface UseEventFetchReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useEventFetch = (params?: {
  isActive?: boolean;
  current?: boolean;
  page?: number;
  limit?: number;
}): UseEventFetchReturn => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getEvents(params);
      setEvents(response.events);
    } catch (err) {
      console.error("이벤트 데이터 가져오기 실패:", err);
      setError("이벤트 데이터를 가져오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [params?.isActive, params?.current, params?.page, params?.limit]);

  return { events, loading, error, refetch: fetchEvents };
};
