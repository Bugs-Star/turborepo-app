/**
 * 스키마 기반 로거
 *
 * 로그를 생성하고 백엔드로 전송
 *
 * 사용법:
 * import { logger } from '@/lib/logger';
 *
 * logger.log('view_screen', {
 *   screen_name: '/products',
 *   previous_screen_name: '/home'
 * });
 */

import {
  NewLogData,
  NewEventName,
  ViewScreenPayload,
  ClickInteractionPayload,
  InteractionType,
} from "@repo/types";

// === SSR 안전 유틸리티 함수들 ===

/**
 * 브라우저 환경인지 확인
 */
const isBrowser = () => typeof window !== "undefined";

/**
 * 로컬 스토리지에서 값 가져오기 (SSR 안전)
 */
const getLocalStorage = (key: string, defaultValue: string): string => {
  if (!isBrowser()) return defaultValue;

  try {
    return localStorage.getItem(key) || defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * 세션 스토리지에서 값 가져오기 (SSR 안전)
 */
const getSessionStorage = (key: string, defaultValue: string): string => {
  if (!isBrowser()) return defaultValue;

  try {
    return sessionStorage.getItem(key) || defaultValue;
  } catch {
    return defaultValue;
  }
};

// === 로거 인터페이스 ===

interface Logger {
  log: (
    eventName: NewEventName,
    payload: ViewScreenPayload | ClickInteractionPayload
  ) => void;
  getQueueSize: () => number;
  forceFlush: () => void;
}

// === 로거 생성 ===

/**
 * 스키마 기반 로거 생성
 */
const createLogger = (): Logger => {
  const state: {
    memoryQueue: NewLogData[];
    batchSize: number;
    flushInterval: number;
    autoFlushInterval?: NodeJS.Timeout;
  } = {
    memoryQueue: [],
    batchSize: 20,
    flushInterval: 5000,
  };

  // 자동 플러시 설정
  const setupAutoFlush = () => {
    if (!isBrowser()) return;

    state.autoFlushInterval = setInterval(() => {
      if (state.memoryQueue.length > 0) {
        forceFlush();
      }
    }, state.flushInterval);
  };

  // 페이지 언로드 시 안전한 전송
  const setupPageUnload = () => {
    if (!isBrowser()) return;

    window.addEventListener("beforeunload", () => {
      if (state.memoryQueue.length > 0) {
        sendImmediate(state.memoryQueue);
      }
    });
  };

  // 강제 플러시
  const forceFlush = () => {
    if (state.memoryQueue.length === 0) return;

    const logsToSend = [...state.memoryQueue];
    state.memoryQueue = [];

    sendBatch(logsToSend);
  };

  // 즉시 전송 함수
  const sendImmediate = async (logs: NewLogData[]): Promise<void> => {
    if (!isBrowser()) return;

    if (process.env.NODE_ENV === "development") {
      console.log("🚨 즉시 전송:", {
        count: logs.length,
        logs: logs.map((log) => ({
          event_name: log.event_name,
          timestamp: log.event_timestamp,
          payload: log.payload,
        })),
      });
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

      if (navigator.sendBeacon) {
        const success = navigator.sendBeacon(
          `${apiUrl}/logs/immediate`,
          JSON.stringify({ logs: logs })
        );
        if (success) return;
      }

      await fetch(`${apiUrl}/logs/immediate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logs: logs }),
      });
    } catch (error) {
      console.error("❌ 즉시 전송 실패:", error);
    }
  };

  // 배치 전송 함수
  const sendBatch = async (logs: NewLogData[]): Promise<void> => {
    if (!isBrowser()) return;

    if (process.env.NODE_ENV === "development") {
      console.log("📊 배치 전송:", {
        count: logs.length,
        logs: logs.map((log) => ({
          event_name: log.event_name,
          timestamp: log.event_timestamp,
          payload: log.payload,
        })),
      });
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

      await fetch(`${apiUrl}/logs/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logs: logs }),
      });
    } catch (error) {
      console.error("❌ 배치 전송 실패:", error);
    }
  };

  // 메인 로그 함수
  const log = (
    eventName: NewEventName,
    payload: ViewScreenPayload | ClickInteractionPayload
  ) => {
    if (!isBrowser()) return;

    // 사용자 식별 정보 초기화 (필요시)
    const initializeUserIdentifiers = () => {
      // 디바이스 ID 생성 (없으면 새로 생성)
      let deviceId = getLocalStorage("deviceId", "");
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        try {
          localStorage.setItem("deviceId", deviceId);
        } catch (e) {
          console.warn("로컬 스토리지 접근 불가:", e);
        }
      }

      // 세션 ID 생성 (없으면 새로 생성)
      let sessionId = getSessionStorage("sessionId", "");
      if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        try {
          sessionStorage.setItem("sessionId", sessionId);
        } catch (e) {
          console.warn("세션 스토리지 접근 불가:", e);
        }
      }

      return { deviceId, sessionId };
    };

    const { deviceId, sessionId } = initializeUserIdentifiers();

    // 스키마로 로그 생성
    const newLogData: NewLogData = {
      event_name: eventName,
      event_timestamp: new Date().toISOString(),
      user_id: getLocalStorage("userId", ""),
      session_id: sessionId,
      device_id: deviceId,
      platform: "Web",
      app_version: "1.0.0",
      payload: payload,
    };

    // 중요 로그 판별 (실패/에러만 즉시 전송)
    const isCritical = (log: NewLogData): boolean => {
      // click_interaction에서 실패/에러 체크
      if (log.event_name === "click_interaction") {
        const payload = log.payload as ClickInteractionPayload;

        // 실패/에러 관련 상호작용만 즉시 전송
        const criticalInteractions: InteractionType[] = [
          "login_failure",
          "signup_failure",
          "critical_error",
        ];

        return criticalInteractions.includes(payload.interaction_type);
      }

      return false;
    };

    if (isCritical(newLogData)) {
      // 중요 로그는 즉시 전송
      sendImmediate([newLogData]);
    } else {
      // 일반 로그는 메모리 큐에 추가
      state.memoryQueue.push(newLogData);

      // 배치 크기에 도달하면 전송
      if (state.memoryQueue.length >= state.batchSize) {
        forceFlush();
      }
    }
  };

  // 큐 크기 반환
  const getQueueSize = () => state.memoryQueue.length;

  // 초기화 (클라이언트에서만)
  if (isBrowser()) {
    setupAutoFlush();
    setupPageUnload();
  }

  return {
    log,
    getQueueSize,
    forceFlush,
  };
};

// === 싱글톤 인스턴스 ===

let loggerInstance: Logger | null = null;

export const logger: Logger = (() => {
  if (!loggerInstance) {
    loggerInstance = createLogger();
  }
  return loggerInstance;
})();

// 타입 export
export type {
  NewLogData,
  NewEventName,
  ViewScreenPayload,
  ClickInteractionPayload,
  InteractionType,
} from "@repo/types";
