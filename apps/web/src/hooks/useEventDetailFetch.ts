import { useState, useEffect } from "react";
import { eventService, Event } from "@/lib/services";

interface UseEventDetailFetchReturn {
  event: Event | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useEventDetailFetch = (id: string): UseEventDetailFetchReturn => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getEvent(id);
      setEvent(response.event);
    } catch (err) {
      console.error("이벤트 상세 정보 가져오기 실패:", err);
      setError("이벤트 정보를 가져오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  return { event, loading, error, refetch: fetchEvent };
};
