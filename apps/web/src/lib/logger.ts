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
import { OfflineLogStorage } from "./offlineStorage";

// === SSR 안전 유틸리티 함수들 ===

/**
 * 브라우저 환경인지 확인
 */
const isBrowser = () => typeof window !== "undefined";

/**
 * 배열을 지정된 크기의 청크로 나눕니다.
 * @param array - 나눌 배열
 * @param size - 각 청크의 크기
 * @returns 청크 배열
 */
const chunk = <T>(array: T[], size: number): T[][] => {
  if (size <= 0) {
    throw new Error("Chunk size must be greater than 0");
  }

  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

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
  flushOfflineLogs: () => Promise<void>;
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
    offlineStorage: OfflineLogStorage;
    isOnline: boolean;
  } = {
    memoryQueue: [],
    batchSize: 20,
    flushInterval: 5000,
    offlineStorage: new OfflineLogStorage(),
    isOnline: navigator.onLine,
  };

  // 네트워크 상태 감지
  const setupNetworkDetection = () => {
    if (!isBrowser()) return;

    window.addEventListener("online", () => {
      state.isOnline = true;
      console.log("🌐 네트워크 연결됨 - 오프라인 로그 전송 시작");

      // 네트워크 복구 시 약간의 지연 후 전송 (안정성 확보)
      setTimeout(() => {
        flushOfflineLogs().catch((error) => {
          console.error("❌ 네트워크 복구 시 로그 전송 실패:", error);
        });
      }, 2000);
    });

    window.addEventListener("offline", () => {
      state.isOnline = false;
      console.log("📴 네트워크 연결 끊김 - 오프라인 모드로 전환");
    });
  };

  // 오프라인 로그 전송
  const flushOfflineLogs = async () => {
    try {
      const pendingLogs = await state.offlineStorage.getPendingLogs();
      if (pendingLogs.length === 0) return;

      console.log(`📤 오프라인 로그 ${pendingLogs.length}개 전송 시작`);

      // 배치로 전송
      const batches = chunk(pendingLogs, state.batchSize);
      let successCount = 0;

      for (const batch of batches) {
        try {
          await sendBatch(batch);
          successCount += batch.length;
        } catch (error) {
          console.error("❌ 배치 전송 실패:", error);
          // 실패한 배치는 다시 IndexedDB에 저장됨 (sendBatch에서 처리)
        }
      }

      // 성공적으로 전송된 로그들만 마킹
      if (successCount > 0) {
        const logIds = Array.from({ length: successCount }, (_, i) => i + 1);
        await state.offlineStorage.markLogsAsSent(logIds);
        console.log(`✅ ${successCount}개 오프라인 로그 전송 완료`);
      }

      // 전송 실패한 로그가 있는지 확인
      const remainingLogs = await state.offlineStorage.getPendingLogs();
      if (remainingLogs.length > 0) {
        console.log(
          `⚠️ ${remainingLogs.length}개 로그 전송 실패 - 다음 네트워크 복구 시 재시도`
        );
      }
    } catch (error) {
      console.error("❌ 오프라인 로그 전송 실패:", error);
    }
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

    window.addEventListener("beforeunload", async () => {
      // 메모리 큐의 로그들을 IndexedDB에 저장
      if (state.memoryQueue.length > 0) {
        try {
          for (const log of state.memoryQueue) {
            await state.offlineStorage.saveLog(log);
          }
          console.log(
            `💾 페이지 언로드 시 ${state.memoryQueue.length}개 로그 저장`
          );
        } catch (error) {
          console.error("❌ 페이지 언로드 시 로그 저장 실패:", error);
        }
      }

      // IndexedDB의 pending 로그들을 sendBeacon으로 전송 시도
      try {
        const pendingLogs = await state.offlineStorage.getPendingLogs();
        if (pendingLogs.length > 0 && navigator.sendBeacon) {
          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
          const success = navigator.sendBeacon(
            `${apiUrl}/logs/batch`,
            JSON.stringify({ logs: pendingLogs })
          );
          if (success) {
            console.log(
              `📤 페이지 언로드 시 ${pendingLogs.length}개 로그 전송 성공`
            );
          }
        }
      } catch (error) {
        console.error("❌ 페이지 언로드 시 로그 전송 실패:", error);
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

      // sendBeacon 우선 시도
      if (navigator.sendBeacon) {
        const success = navigator.sendBeacon(
          `${apiUrl}/logs/immediate`,
          JSON.stringify({ logs: logs })
        );
        if (success) return;
      }

      // fetch로 재시도
      const response = await fetch(`${apiUrl}/logs/immediate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logs: logs }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("❌ 즉시 전송 실패:", error);

      // 실패한 로그들을 IndexedDB에 저장
      try {
        for (const log of logs) {
          await state.offlineStorage.saveLog(log);
        }
        console.log(
          `💾 즉시 전송 실패 로그 ${logs.length}개를 오프라인 저장소에 저장`
        );
      } catch (dbError) {
        console.error("❌ IndexedDB 저장 실패:", dbError);
      }
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

      const response = await fetch(`${apiUrl}/logs/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logs: logs }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("❌ 배치 전송 실패:", error);

      // 실패한 로그들을 IndexedDB에 저장
      try {
        for (const log of logs) {
          await state.offlineStorage.saveLog(log);
        }
        console.log(`💾 ${logs.length}개 로그를 오프라인 저장소에 저장`);
      } catch (dbError) {
        console.error("❌ IndexedDB 저장 실패:", dbError);
        // 최후의 수단: 메모리에 임시 저장
        state.memoryQueue.push(...logs);
      }

      throw error;
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
  const initialize = async () => {
    if (!isBrowser()) return;

    try {
      await state.offlineStorage.init();
      setupAutoFlush();
      setupPageUnload();
      setupNetworkDetection();

      // 앱 시작 시 오프라인 로그 전송 시도
      if (state.isOnline) {
        setTimeout(() => {
          flushOfflineLogs().catch((error) => {
            console.error("❌ 앱 시작 시 오프라인 로그 전송 실패:", error);
          });
        }, 1000); // 1초 후 실행
      }

      console.log("✅ 로거 초기화 완료");
    } catch (error) {
      console.error("❌ 로거 초기화 실패:", error);
      // 초기화 실패해도 기본 기능은 동작하도록 함
    }
  };

  // 주기적 정리 작업 설정
  const setupCleanup = () => {
    if (!isBrowser()) return;

    // 24시간마다 오래된 로그 정리
    setInterval(
      async () => {
        try {
          await state.offlineStorage.cleanupOldLogs(7); // 7일 이상 된 로그 정리
        } catch (error) {
          console.error("❌ 로그 정리 실패:", error);
        }
      },
      24 * 60 * 60 * 1000
    ); // 24시간
  };

  // 초기화 실행
  initialize();
  setupCleanup();

  return {
    log,
    getQueueSize,
    forceFlush,
    flushOfflineLogs,
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
