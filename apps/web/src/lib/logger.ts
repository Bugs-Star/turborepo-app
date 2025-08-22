/**
 * 카페앱 프론트엔드 로거
 *
 * Collector, Formatter, Storage, Transport 기능을 모두 포함한 단일 클래스
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

class FrontendLogger {
  // === Storage: 메모리 큐 관리 ===
  private memoryQueue: LogData[] = [];
  private criticalQueue: LogData[] = [];

  // 일반 이벤트 설정
  private eventBatchSize = DEFAULT_BATCH_CONFIG.events.size; // 20개
  private eventFlushInterval = DEFAULT_BATCH_CONFIG.events.timeout; // 5000ms

  // 중요 로그 설정
  private criticalBatchSize = DEFAULT_BATCH_CONFIG.critical.size; // 5개
  private criticalFlushInterval = DEFAULT_BATCH_CONFIG.critical.timeout; // 1000ms

  constructor() {
    this.setupAutoFlush();
    this.setupPageUnload();
  }

  // === Logger: 메인 로그 메서드 ===
  log(eventName: EventName, payload: any = {}) {
    // 1. Collector: 이벤트 수집
    const rawEvent = this.collectEvent(eventName, payload);

    // 2. Formatter: 로그 정제
    const formattedLog = this.formatLog(rawEvent);

    // 3. Storage: 메모리 큐에 저장
    this.addToMemoryQueue(formattedLog);

    // 4. 배치 크기 확인
    if (this.memoryQueue.length >= this.eventBatchSize) {
      this.flushEvents();
    }

    // 중요 로그는 별도 큐에 저장
    if (this.isCritical(formattedLog)) {
      this.criticalQueue.push(formattedLog);
      if (this.criticalQueue.length >= this.criticalBatchSize) {
        this.flushCritical();
      }
    }
  }

  // === Collector: 이벤트 수집 ===
  private collectEvent(eventName: EventName, payload: any) {
    return {
      type: eventName,
      timestamp: Date.now(),
      metadata: payload,
    };
  }

  // === Formatter: 로그 정제 ===
  private formatLog(rawEvent: any): LogData {
    return {
      event_name: rawEvent.type,
      event_timestamp: new Date(rawEvent.timestamp).toISOString(),
      user_id: this.getCurrentUserId(),
      device_id: this.getDeviceId(),
      session_id: this.getSessionId(),
      payload: {
        ...rawEvent.metadata,
        page: typeof window !== "undefined" ? window.location.pathname : "",
        page_title: typeof document !== "undefined" ? document.title : "",
        referrer: typeof document !== "undefined" ? document.referrer : "",
      },
    };
  }

  // === Storage: 메모리 큐 관리 ===
  private addToMemoryQueue(logData: LogData) {
    this.memoryQueue.push(logData);
  }

  private getMemoryQueue(): LogData[] {
    return [...this.memoryQueue];
  }

  private clearMemoryQueue() {
    this.memoryQueue = [];
  }

  // === Transport: 전송 관리 ===
  private async flushEvents() {
    if (this.memoryQueue.length === 0) return;

    const logs = this.getMemoryQueue();

    try {
      await this.sendEvents(logs);
      this.clearMemoryQueue();
    } catch (error) {
      console.error("일반 이벤트 전송 실패:", error);
    }
  }

  private async flushCritical() {
    if (this.criticalQueue.length === 0) return;

    const logs = [...this.criticalQueue];

    try {
      await this.sendCritical(logs);
      this.criticalQueue = [];
    } catch (error) {
      console.error("중요 로그 전송 실패:", error);
    }
  }

  private async flush() {
    await Promise.all([this.flushEvents(), this.flushCritical()]);
  }

  private async sendLogs(logs: LogData[]) {
    const events = logs.filter((log) => !this.isCritical(log));
    const critical = logs.filter((log) => this.isCritical(log));

    const promises = [];

    if (events.length > 0) {
      promises.push(this.sendEvents(events));
    }

    if (critical.length > 0) {
      promises.push(this.sendCritical(critical));
    }

    await Promise.all(promises);
  }

  private async sendEvents(logs: LogData[]) {
    // 임시로 콘솔 출력 (나중에 실제 API 호출로 변경)
    console.log("📊 일반 이벤트 전송:", {
      count: logs.length,
      logs: logs.map((log) => ({
        event_name: log.event_name,
        timestamp: log.event_timestamp,
        payload: log.payload,
      })),
    });

    // 실제 API 호출 (백엔드 구현 후 활성화)
    // await fetch('/api/logs/events', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ logs })
    // });
  }

  private async sendCritical(logs: LogData[]) {
    // 임시로 콘솔 출력 (나중에 실제 API 호출로 변경)
    console.log("🚨 중요 로그 전송:", {
      count: logs.length,
      logs: logs.map((log) => ({
        event_name: log.event_name,
        timestamp: log.event_timestamp,
        payload: log.payload,
      })),
    });

    // 실제 API 호출 (백엔드 구현 후 활성화)
    // await fetch('/api/logs/critical', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ logs })
    // });
  }

  // === 유틸리티 메서드들 ===
  private isCritical(log: LogData): boolean {
    return (
      log.event_name === "error" ||
      log.event_name === "security" ||
      log.event_name === "payment_failure" ||
      log.event_name === "authentication_fail" ||
      log.event_name === "performance_issue" ||
      log.event_name === "logout"
    );
  }

  private getCurrentUserId(): string | undefined {
    // 인증 상태에서 사용자 ID 가져오기
    // 실제 구현에서는 인증 스토어에서 가져옴
    if (typeof window === "undefined") return undefined;
    return localStorage.getItem("user_id") || undefined;
  }

  private getDeviceId(): string {
    if (typeof window === "undefined") return "server-device-id";

    let deviceId = localStorage.getItem("device_id");
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("device_id", deviceId);
    }
    return deviceId;
  }

  private getSessionId(): string {
    if (typeof window === "undefined") return "server-session-id";

    let sessionId = sessionStorage.getItem("session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("session_id", sessionId);
    }
    return sessionId;
  }

  // === 설정 메서드들 ===
  private setupAutoFlush() {
    // 브라우저 환경에서만 실행
    if (typeof window === "undefined") return;

    // 일반 이벤트: 5초마다 전송
    setInterval(() => this.flushEvents(), this.eventFlushInterval);

    // 중요 로그: 1초마다 전송
    setInterval(() => this.flushCritical(), this.criticalFlushInterval);
  }

  private setupPageUnload() {
    // 브라우저 환경에서만 실행
    if (typeof window === "undefined") return;

    window.addEventListener("beforeunload", () => {
      if (this.memoryQueue.length > 0) {
        // sendBeacon으로 안전한 전송 (API 엔드포인트 구현 전까지 임시 비활성화)
        // const apiBaseUrl =
        //   process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
        // navigator.sendBeacon(
        //   `${apiBaseUrl}/logs/events`,
        //   JSON.stringify({
        //     logs: this.memoryQueue,
        //   })
        // );

        // 임시로 콘솔에 출력
        console.log("📤 페이지 종료 시 로그 전송:", {
          count: this.memoryQueue.length,
          logs: this.memoryQueue,
        });
      }
    });
  }

  // === 디버깅용 메서드들 (개발용) ===
  getQueueSize(): number {
    return this.memoryQueue.length + this.criticalQueue.length;
  }

  getEventQueueSize(): number {
    return this.memoryQueue.length;
  }

  getCriticalQueueSize(): number {
    return this.criticalQueue.length;
  }

  forceFlush() {
    this.flush();
  }
}

// 싱글톤 인스턴스 (지연 초기화)
let loggerInstance: FrontendLogger | null = null;

export const logger = {
  log: (eventName: EventName, payload: any = {}) => {
    if (!loggerInstance) {
      loggerInstance = new FrontendLogger();
    }
    loggerInstance.log(eventName, payload);
  },

  getQueueSize: (): number => {
    if (!loggerInstance) return 0;
    return loggerInstance.getQueueSize();
  },

  getEventQueueSize: (): number => {
    if (!loggerInstance) return 0;
    return loggerInstance.getEventQueueSize();
  },

  getCriticalQueueSize: (): number => {
    if (!loggerInstance) return 0;
    return loggerInstance.getCriticalQueueSize();
  },

  forceFlush: () => {
    if (!loggerInstance) return;
    loggerInstance.forceFlush();
  },
};
