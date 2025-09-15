/**
 * 카페앱 로그 데이터 타입 정의
 *
 * 사용법:
 * import { LogData, EventName } from '@repo/types';
 *
 * const logData: LogData = {
 *   eventName: 'product_click',
 *   eventTimestamp: new Date().toISOString(),
 *   userId: 'user_123',
 *   deviceId: 'device_456',
 *   sessionId: 'sess_789',
 *   payload: { productId: 'prod_001' }
 * };
 */

// ===== 스키마 (v2) =====

// 이벤트 타입 정의
export type NewEventName =
  | "viewScreen"
  | "clickInteraction"
  | "viewScreenDuration";

// 로그 데이터 기본 구조
export interface NewLogData {
  eventName: NewEventName;
  eventTimestamp: string;
  userId?: string;
  sessionId: string;
  deviceId: string;
  platform: string;
  appVersion: string;
  payload:
    | ViewScreenPayload
    | ClickInteractionPayload
    | ViewScreenDurationPayload;
}

// 화면 조회 이벤트 Payload
export interface ViewScreenPayload {
  screenName: string;
  previousScreenName?: string;
}

// 화면 체류 시간 이벤트 Payload
export interface ViewScreenDurationPayload {
  screenName: string;
  durationSeconds: number;
  startTime: string;
  endTime: string;
}

// 클릭 상호작용 이벤트 Payload
export interface ClickInteractionPayload {
  interactionType: InteractionType;
  targetId?: string;
  targetName?: string;
  sourceComponent?: string;
  // 추가 필드들 (필요에 따라 확장)
  [key: string]: any;
}

// 상호작용 타입 상세 분류
export type InteractionType =
  // 사용자 인증/세션
  | "buttonLoginSubmit"
  | "buttonSignupSubmit"
  | "buttonLogout"
  | "buttonProfileEdit"
  | "buttonOrderHistory"
  // 실패/에러 (즉시 전송)
  | "loginFailure"
  | "signupFailure"
  | "criticalError"
  // 일반 에러 (배치 전송)
  | "generalError"
  // 상품 탐색 및 발견
  | "productCard"
  | "categoryLink"
  | "adBanner"
  | "searchSubmit"
  | "sortOptionSelect"
  // 장바구니 및 결제
  | "buttonAddToCart"
  | "buttonRemoveItem"
  | "buttonCreateOrder"
  // 프로모션 및 이벤트
  | "eventCard"
  | "promotionCard"
  | "buttonEventParticipate"
  | "buttonCouponDownload"
  // 기타 상호작용
  | "navLink"
  | "buttonViewMore"
  | "buttonPopupClose"
  | "signupAttempt"
  | "signupSuccess"
  | "loginLink";

// API 요청 타입
export interface EventsRequest {
  logs: NewLogData[];
}

export interface CriticalRequest {
  logs: NewLogData[];
}
