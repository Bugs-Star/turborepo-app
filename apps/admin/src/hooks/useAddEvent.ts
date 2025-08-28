import { useState } from "react";
import { EventsService, AddEventPayload, EventItem } from "@/lib/events";

export const useAddEvent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addEvent = async (payload: AddEventPayload): Promise<EventItem> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await EventsService.addEvent(payload);
      setIsLoading(false);
      return data;
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.response?.data?.message || "이벤트 추가 실패");
      throw err;
    }
  };

  return { addEvent, isLoading, error };
};
