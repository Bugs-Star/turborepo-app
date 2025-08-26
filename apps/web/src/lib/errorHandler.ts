/**
 * 통합 에러 핸들러
 * 애플리케이션 전체의 에러를 중앙에서 처리하는 시스템
 *
 * 즉시 전송되는 에러 (critical_error):
 * - 서버 에러 (5xx): 서버 다운, 내부 오류
 * - 인증 에러 (401): 토큰 만료, 인증 실패
 * - 권한 에러 (403): 접근 권한 없음
 * - 결제 실패: 금융 관련 보안 이슈
 * - 로그인 실패: 보안 관련 이슈
 *
 * 배치 전송되는 에러 (error):
 * - 클라이언트 에러 (4xx): 사용자 입력 오류, 리소스 없음
 * - 네트워크 에러: 일시적 연결 문제
 * - 일반 에러: 기타 모든 에러
 */

import { logger } from "./logger";

// 에러 분류 타입
export interface ErrorClassification {
  type:
    | "server_error"
    | "authentication_error"
    | "authorization_error"
    | "payment_error"
    | "network_error"
    | "validation_error"
    | "general_error";
  isCritical: boolean;
  priority: "high" | "medium" | "low";
  userFriendlyMessage: string;
}

// 에러 컨텍스트 정보
export interface ErrorContext {
  error_message: string;
  error_code?: number;
  error_type: string;
  context: string;
  component?: string;
  page: string;
  user_id?: string;
  session_id: string;
  browser: string;
  timestamp: string;
  stack_trace?: string;
  endpoint?: string;
  request_data?: any;
  response_data?: any;
}

/**
 * 에러 분류 시스템
 * 정말 중요한 에러만 즉시 전송하도록 엄격하게 분류
 */
const classifyError = (error: any): ErrorClassification => {
  // HTTP 상태 코드별 분류
  if (error.response?.status >= 500) {
    return {
      type: "server_error",
      isCritical: true,
      priority: "high",
      userFriendlyMessage:
        "일시적인 서버 오류입니다. 잠시 후 다시 시도해주세요.",
    };
  }

  if (error.response?.status === 401) {
    return {
      type: "authentication_error",
      isCritical: true,
      priority: "high",
      userFriendlyMessage: "로그인이 필요합니다. 다시 로그인해주세요.",
    };
  }

  if (error.response?.status === 403) {
    return {
      type: "authorization_error",
      isCritical: true,
      priority: "high",
      userFriendlyMessage: "접근 권한이 없습니다.",
    };
  }

  // 4xx 에러들은 모두 배치 전송 (중요하지 않음)
  if (error.response?.status >= 400 && error.response?.status < 500) {
    return {
      type: "validation_error",
      isCritical: false,
      priority: "medium",
      userFriendlyMessage: "입력 정보를 확인해주세요.",
    };
  }

  // 네트워크 에러는 배치 전송 (일시적 문제)
  if (error.request && !error.response) {
    return {
      type: "network_error",
      isCritical: false,
      priority: "medium",
      userFriendlyMessage: "네트워크 연결을 확인해주세요.",
    };
  }

  // 비즈니스 로직별 분류 (더 엄격하게)
  const errorMessage = error.message?.toLowerCase() || "";
  const context = error.config?.url || "";

  // 결제 관련 에러만 즉시 전송 (금융 보안)
  if (
    (errorMessage.includes("payment") && errorMessage.includes("fail")) ||
    (context.includes("payment") && error.response?.status >= 400) ||
    (context.includes("order") && error.response?.status >= 400)
  ) {
    return {
      type: "payment_error",
      isCritical: true,
      priority: "high",
      userFriendlyMessage:
        "결제 처리 중 오류가 발생했습니다. 카드 정보를 확인해주세요.",
    };
  }

  // 인증 관련 에러만 즉시 전송 (보안)
  if (
    (errorMessage.includes("login") && errorMessage.includes("fail")) ||
    (errorMessage.includes("auth") && error.response?.status >= 400)
  ) {
    return {
      type: "authentication_error",
      isCritical: true,
      priority: "high",
      userFriendlyMessage: "로그인에 실패했습니다. 정보를 확인해주세요.",
    };
  }

  // 기본 분류 (모든 일반 에러는 배치 전송)
  return {
    type: "general_error",
    isCritical: false,
    priority: "low",
    userFriendlyMessage: "오류가 발생했습니다. 다시 시도해주세요.",
  };
};

/**
 * 민감한 정보 필터링
 */
const sanitizeErrorData = (error: any): any => {
  const sanitized = { ...error };

  // 민감한 정보 제거
  delete sanitized.password;
  delete sanitized.accessToken;
  delete sanitized.refreshToken;
  delete sanitized.token;

  // 요청/응답 데이터에서 민감 정보 제거
  if (sanitized.config?.data) {
    try {
      const data =
        typeof sanitized.config.data === "string"
          ? JSON.parse(sanitized.config.data)
          : sanitized.config.data;

      delete data.password;
      delete data.accessToken;
      delete data.refreshToken;

      sanitized.config.data = data;
    } catch {
      // JSON 파싱 실패 시 원본 유지
    }
  }

  if (sanitized.response?.data) {
    const responseData = { ...sanitized.response.data };
    delete responseData.password;
    delete responseData.accessToken;
    delete responseData.refreshToken;
    sanitized.response.data = responseData;
  }

  return sanitized;
};

/**
 * 에러 컨텍스트 정보 수집
 */
const collectErrorContext = (error: any, context: string): ErrorContext => {
  const sanitizedError = sanitizeErrorData(error);

  return {
    error_message: error.message || "Unknown error",
    error_code: error.response?.status,
    error_type: error.name || "Error",
    context: context,
    component: getCurrentComponent(),
    page: typeof window !== "undefined" ? window.location.pathname : "",
    user_id: getUserId(),
    session_id: getSessionId(),
    browser: typeof navigator !== "undefined" ? navigator.userAgent : "",
    timestamp: new Date().toISOString(),
    stack_trace: error.stack,
    endpoint: error.config?.url,
    request_data: sanitizedError.config?.data,
    response_data: sanitizedError.response?.data,
  };
};

/**
 * 현재 컴포넌트 정보 가져오기 (개발 환경에서만)
 */
const getCurrentComponent = (): string | undefined => {
  if (process.env.NODE_ENV !== "development") return undefined;

  try {
    const stack = new Error().stack;
    const lines = stack?.split("\n") || [];
    const componentLine = lines.find(
      (line) =>
        line.includes(".tsx") ||
        line.includes(".ts") ||
        line.includes("Component")
    );
    return componentLine?.trim() || undefined;
  } catch {
    return undefined;
  }
};

/**
 * 사용자 ID 가져오기
 */
const getUserId = (): string | undefined => {
  if (typeof window === "undefined") return undefined;

  try {
    return localStorage.getItem("userId") || undefined;
  } catch {
    return undefined;
  }
};

/**
 * 세션 ID 가져오기
 */
const getSessionId = (): string => {
  if (typeof window === "undefined") return "unknown";

  try {
    return sessionStorage.getItem("sessionId") || "unknown";
  } catch {
    return "unknown";
  }
};

/**
 * 사용자 알림 처리
 */
const notifyUser = (error: any, classification: ErrorClassification) => {
  // 개발 환경에서는 콘솔에도 출력
  if (process.env.NODE_ENV === "development") {
    console.error(`[${classification.type.toUpperCase()}]`, {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      classification: classification,
    });
  }

  // 사용자에게 토스트 알림 (외부에서 처리)
  // showToast(classification.userFriendlyMessage, "error");
};

/**
 * 통합 에러 핸들러 클래스
 */
export class ErrorHandler {
  /**
   * 에러 처리 메인 함수
   */
  static handle(error: any, context: string) {
    try {
      // 1. 에러 분류
      const classification = classifyError(error);

      // 2. 사용자 알림
      notifyUser(error, classification);

      // 3. 에러 컨텍스트 수집
      const errorContext = collectErrorContext(error, context);

      // 4. 로깅 (중요도에 따라)
      if (classification.isCritical) {
        // 즉시 전송 (중요한 에러)
        logger.log("critical_error", {
          ...errorContext,
          priority: classification.priority,
          user_friendly_message: classification.userFriendlyMessage,
        });
      } else {
        // 배치 전송 (일반적인 에러)
        logger.log("error", {
          ...errorContext,
          priority: classification.priority,
          user_friendly_message: classification.userFriendlyMessage,
        });
      }

      // 5. 분석 데이터 수집 (향후 확장용)
      this.collectAnalytics(error, context, classification);
    } catch (handlerError) {
      // 에러 핸들러 자체에서 에러가 발생한 경우
      console.error("Error handler failed:", handlerError);

      // 최소한의 로깅 시도 (에러 핸들러 자체 에러는 항상 중요)
      try {
        logger.log("critical_error", {
          error_message: "Error handler failed",
          original_error: error.message,
          handler_error:
            handlerError instanceof Error
              ? handlerError.message
              : String(handlerError),
          context: context,
          timestamp: new Date().toISOString(),
        });
      } catch {
        // 로깅도 실패한 경우 콘솔에만 출력
        console.error("Critical: Both error handling and logging failed", {
          originalError: error,
          handlerError: handlerError,
        });
      }
    }
  }

  /**
   * 분석 데이터 수집 (향후 확장용)
   */
  private static collectAnalytics(
    error: any,
    context: string,
    classification: ErrorClassification
  ) {
    // 여기에 에러 분석 데이터 수집 로직 추가 가능
    // 예: 에러 발생 빈도, 사용자별 에러 패턴, 시간대별 에러 분포 등

    if (process.env.NODE_ENV === "development") {
      console.log("Error Analytics:", {
        type: classification.type,
        context: context,
        priority: classification.priority,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 특정 에러 타입만 처리
   */
  static handleCritical(error: any, context: string) {
    const classification = classifyError(error);
    if (classification.isCritical) {
      this.handle(error, context);
    }
  }

  /**
   * 사용자 친화적 메시지만 반환
   */
  static getUserFriendlyMessage(error: any): string {
    const classification = classifyError(error);
    return classification.userFriendlyMessage;
  }

  /**
   * 에러가 중요한지 확인
   */
  static isCritical(error: any): boolean {
    const classification = classifyError(error);
    return classification.isCritical;
  }
}

// 편의를 위한 함수들
export const handleError = (error: any, context: string) =>
  ErrorHandler.handle(error, context);
export const handleCriticalError = (error: any, context: string) =>
  ErrorHandler.handleCritical(error, context);
export const getUserFriendlyMessage = (error: any) =>
  ErrorHandler.getUserFriendlyMessage(error);
export const isCriticalError = (error: any) => ErrorHandler.isCritical(error);
