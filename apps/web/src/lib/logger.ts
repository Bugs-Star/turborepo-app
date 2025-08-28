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
 * 성능 메트릭 업데이트
 */
const updatePerformanceMetrics = (
  metrics: {
    totalLogsSent: number;
    totalLogsStored: number;
    averageSendTime: number;
    lastSendTime: number;
  },
  logsCount: number,
  sendTime: number,
  isStored: boolean = false
) => {
  metrics.totalLogsSent += logsCount;
  if (isStored) {
    metrics.totalLogsStored += logsCount;
  }

  // 평균 전송 시간 계산
  const totalTime =
    metrics.averageSendTime * (metrics.totalLogsSent - logsCount) + sendTime;
  metrics.averageSendTime = totalTime / metrics.totalLogsSent;
  metrics.lastSendTime = sendTime;
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
  getPerformanceMetrics: () => {
    totalLogsSent: number;
    totalLogsStored: number;
    averageSendTime: number;
    lastSendTime: number;
  };
}

// === 로거 생성 ===

/**
 * 스키마 기반 로거 생성
 */
const createLogger = (): Logger => {
  // 중요 로그 판별을 위한 Set (O(1) 검색 최적화)
  const CRITICAL_INTERACTIONS = new Set<InteractionType>([
    "login_failure",
    "signup_failure",
    "critical_error",
  ]);

  const state: {
    memoryQueue: NewLogData[];
    batchSize: number;
    flushInterval: number;
    autoFlushInterval?: NodeJS.Timeout;
    offlineStorage: OfflineLogStorage;
    isOnline: boolean;
    performanceMetrics: {
      totalLogsSent: number;
      totalLogsStored: number;
      averageSendTime: number;
      lastSendTime: number;
    };
  } = {
    memoryQueue: [],
    batchSize: parseInt(process.env.NEXT_PUBLIC_LOG_BATCH_SIZE || "20"),
    flushInterval: parseInt(
      process.env.NEXT_PUBLIC_LOG_FLUSH_INTERVAL || "10000"
    ),
    offlineStorage: new OfflineLogStorage(),
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    performanceMetrics: {
      totalLogsSent: 0,
      totalLogsStored: 0,
      averageSendTime: 0,
      lastSendTime: 0,
    },
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

      // 성공적으로 전송된 로그들만 배치 마킹
      if (successCount > 0) {
        // 실제 전송된 로그들의 ID를 가져와서 배치 마킹
        const sentLogIds = await state.offlineStorage.getLogIdsByPayloads(
          pendingLogs.slice(0, successCount)
        );
        await state.offlineStorage.markLogsAsSentBatch(sentLogIds);
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

    window.addEventListener("beforeunload", () => {
      // 메모리 큐의 로그들을 IndexedDB에 배치 저장 (동기적으로)
      if (state.memoryQueue.length > 0) {
        try {
          // 동기적으로 저장 (async/await 제거)
          state.offlineStorage
            .saveLogsBatch(state.memoryQueue)
            .catch((error) => {
              console.error("❌ 페이지 언로드 시 로그 배치 저장 실패:", error);
            });
          console.log(
            `💾 페이지 언로드 시 ${state.memoryQueue.length}개 로그 배치 저장`
          );
        } catch (error) {
          console.error("❌ 페이지 언로드 시 로그 배치 저장 실패:", error);
        }
      }

      // IndexedDB의 pending 로그들을 sendBeacon으로 전송 시도 (동기적으로)
      try {
        // 동기적으로 pending 로그 가져오기
        state.offlineStorage
          .getPendingLogs()
          .then((pendingLogs) => {
            if (
              pendingLogs.length > 0 &&
              typeof navigator !== "undefined" &&
              navigator.sendBeacon
            ) {
              const apiUrl =
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

              // Blob으로 Content-Type 명시
              const blob = new Blob([JSON.stringify({ logs: pendingLogs })], {
                type: "application/json",
              });

              const success = navigator.sendBeacon(
                `${apiUrl}/logs/batch`,
                blob
              );
              if (success) {
                console.log(
                  `📤 페이지 언로드 시 ${pendingLogs.length}개 로그 전송 성공`
                );
              }
            }
          })
          .catch((error) => {
            console.error("❌ 페이지 언로드 시 로그 전송 실패:", error);
          });
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

  // 즉시 전송 함수 (재시도 로직 포함)
  const sendImmediate = async (
    logs: NewLogData[],
    retries = 2
  ): Promise<void> => {
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

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
        const data = JSON.stringify({ logs: logs });

        // sendBeacon 우선 시도 (페이지 언로드 시 안전)
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          const blob = new Blob([data], { type: "application/json" });
          const success = navigator.sendBeacon(
            `${apiUrl}/logs/immediate`,
            blob
          );
          if (success) return;
        }

        // fallback으로 fetch 사용
        const response = await fetch(`${apiUrl}/logs/immediate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: data,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        // 성공 시 즉시 반환
        return;
      } catch (error) {
        console.error(`❌ 즉시 전송 실패 (시도 ${attempt}/${retries}):`, error);

        // 마지막 시도가 아니면 짧은 지연 후 재시도
        if (attempt < retries) {
          const delay = 500 * attempt; // 500ms, 1000ms
          console.log(`🔄 ${delay}ms 후 재시도...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // 모든 재시도 실패 시 IndexedDB에 저장
        try {
          await state.offlineStorage.saveLogsBatch(logs);
          console.log(
            `💾 즉시 전송 실패 로그 ${logs.length}개를 오프라인 저장소에 배치 저장`
          );
        } catch (dbError) {
          console.error("❌ IndexedDB 배치 저장 실패:", dbError);
        }
      }
    }
  };

  // 배치 전송 함수 (재시도 로직 포함)
  const sendBatch = async (logs: NewLogData[], retries = 3): Promise<void> => {
    if (!isBrowser()) return;

    const startTime = performance.now();

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

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

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

        // 성능 메트릭 업데이트
        const sendTime = performance.now() - startTime;
        updatePerformanceMetrics(
          state.performanceMetrics,
          logs.length,
          sendTime
        );

        // 성공 시 즉시 반환
        return;
      } catch (error) {
        console.error(`❌ 배치 전송 실패 (시도 ${attempt}/${retries}):`, error);

        // 마지막 시도가 아니면 지수 백오프로 재시도
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // 최대 5초
          console.log(`🔄 ${delay}ms 후 재시도...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // 모든 재시도 실패 시 IndexedDB에 저장
        try {
          await state.offlineStorage.saveLogsBatch(logs);
          const sendTime = performance.now() - startTime;
          updatePerformanceMetrics(
            state.performanceMetrics,
            logs.length,
            sendTime,
            true
          );
          console.log(`💾 ${logs.length}개 로그를 오프라인 저장소에 배치 저장`);
        } catch (dbError) {
          console.error("❌ IndexedDB 배치 저장 실패:", dbError);
          // 최후의 수단: 메모리에 임시 저장
          state.memoryQueue.push(...logs);
        }

        throw error;
      }
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
        return CRITICAL_INTERACTIONS.has(payload.interaction_type);
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

  // 성능 메트릭 반환
  const getPerformanceMetrics = () => ({ ...state.performanceMetrics });

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
    getPerformanceMetrics,
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
