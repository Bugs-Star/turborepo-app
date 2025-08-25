/**
 * - sendImmediate: 즉시 전송 (중요 로그)
 * - flushAll: 배치 전송 (모든 로그)
 *
 * 사용법:
 * import { logger } from '@/lib/logger';
 *
 * logger.log('product_click', {
 *   product_id: 'prod_001',
 *   product_name: '아메리카노',
 *   product_price: 4500
 * });
 */

import { LogData, EventName, DEFAULT_BATCH_CONFIG } from "@repo/types";

// === 타입 정의 ===
interface LoggerState {
  memoryQueue: LogData[];
  batchSize: number;
  flushInterval: number;
  autoFlushInterval?: NodeJS.Timeout;
}

interface Logger {
  log: (eventName: EventName, payload: any) => void;
  getQueueSize: () => number;
  forceFlush: () => void;
}

// === SSR 안전 유틸리티 함수들 ===

/**
 * 브라우저 환경인지 확인
 */
const isBrowser = () => typeof window !== "undefined";

/**
 * 안전한 localStorage 접근
 */
const getLocalStorage = (key: string, defaultValue: string = ""): string => {
  if (!isBrowser()) return defaultValue;
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * 안전한 sessionStorage 접근
 */
const getSessionStorage = (key: string, defaultValue: string = ""): string => {
  if (!isBrowser()) return defaultValue;
  try {
    return sessionStorage.getItem(key) || defaultValue;
  } catch {
    return defaultValue;
  }
};

// === 순수 함수들 ===

/**
 * 이벤트 수집 함수
 */
const collectEvent = (eventName: EventName, payload: any) => ({
  type: eventName,
  data: payload,
  timestamp: new Date().toISOString(),
});

/**
 * 로그 포맷팅 함수
 */
const formatLog = (rawEvent: any): LogData => {
  const deviceId = getLocalStorage("deviceId", "unknown");
  const sessionId = getSessionStorage("sessionId", "unknown");
  const userId = getLocalStorage("userId", "");

  return {
    event_name: rawEvent.type,
    event_timestamp: rawEvent.timestamp,
    user_id: userId || undefined,
    device_id: deviceId,
    session_id: sessionId,
    payload: rawEvent.data,
  };
};

/**
 * 중요 로그 판별 함수
 */
const isCritical = (log: LogData): boolean => {
  const criticalEvents = [
    "login_attempt",
    "login_success", // 추가: 로그인 성공도 중요 로그
    "signup_success",
    "payment_initiated",
    "order_created",
  ];
  return criticalEvents.includes(log.event_name);
};

/**
 * 페이지 정보 수집 함수 (SSR 안전)
 */
const getPageInfo = () => {
  if (!isBrowser()) {
    return {
      url: "",
      title: "",
      referrer: "",
    };
  }

  return {
    url: window.location.href,
    title: document.title,
    referrer: document.referrer,
  };
};

// === 부수 효과 함수들 ===

/**
 * 즉시 전송 함수
 */
const sendImmediate = async (logs: LogData[]): Promise<void> => {
  if (!isBrowser()) return;

  // 개발 환경에서는 콘솔에도 출력
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

    // sendBeacon API 사용 (페이지 언로드 시에도 안전하게 전송)
    if (navigator.sendBeacon) {
      const success = navigator.sendBeacon(
        `${apiUrl}/logs/immediate`,
        JSON.stringify(logs)
      );
      if (success) return;
    }

    // sendBeacon 실패 시 fetch 사용
    await fetch(`${apiUrl}/logs/immediate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logs),
    });
  } catch (error) {
    console.error("❌ 즉시 전송 실패:", error);
  }
};

/**
 * 배치 전송 함수
 */
const sendBatch = async (logs: LogData[]): Promise<void> => {
  if (!isBrowser()) return;

  // 개발 환경에서는 콘솔에도 출력
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
      body: JSON.stringify(logs),
    });
  } catch (error) {
    console.error("❌ 배치 전송 실패:", error);
  }
};

// === 로거 생성 함수 ===

/**
 * 로거 인스턴스 생성
 */
const createLogger = (): Logger => {
  const state: LoggerState = {
    memoryQueue: [],
    batchSize: DEFAULT_BATCH_CONFIG.events.size,
    flushInterval: DEFAULT_BATCH_CONFIG.events.timeout,
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
        // 개발 환경에서는 콘솔에도 출력
        if (process.env.NODE_ENV === "development") {
          console.log("📤 페이지 종료 시 로그 전송:", {
            count: state.memoryQueue.length,
            logs: state.memoryQueue.map((log) => ({
              event_name: log.event_name,
              timestamp: log.event_timestamp,
              payload: log.payload,
            })),
          });
        }
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

  // 메인 로그 함수
  const log = (eventName: EventName, payload: any = {}) => {
    // SSR 중에는 로그를 수집하지 않음
    if (!isBrowser()) return;

    const rawEvent = collectEvent(eventName, payload);
    const formattedLog = formatLog(rawEvent);

    if (isCritical(formattedLog)) {
      // 중요 로그는 즉시 전송
      sendImmediate([formattedLog]);
    } else {
      // 일반 로그는 메모리 큐에 추가
      state.memoryQueue.push(formattedLog);

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
