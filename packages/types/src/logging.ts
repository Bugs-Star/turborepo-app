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
export type NewEventName = "view_screen" | "click_interaction";

// 로그 데이터 기본 구조
export interface NewLogData {
  eventName: NewEventName;
  eventTimestamp: string;
  userId?: string;
  sessionId: string;
  deviceId: string;
  platform: string;
  appVersion: string;
  payload: ViewScreenPayload | ClickInteractionPayload;
}

// 화면 조회 이벤트 Payload
export interface ViewScreenPayload {
  screenName: string;
  previousScreenName?: string;
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
  | "button_login_submit"
  | "button_signup_submit"
  | "button_logout"
  | "button_profile_edit"
  | "button_order_history"
  // 실패/에러 (즉시 전송)
  | "login_failure"
  | "signup_failure"
  | "critical_error"
  // 상품 탐색 및 발견
  | "product_card"
  | "category_link"
  | "ad_banner"
  | "search_submit"
  | "sort_option_select"
  // 장바구니 및 결제
  | "button_add_to_cart"
  | "button_increase_quantity"
  | "button_decrease_quantity"
  | "button_remove_item"
  | "button_create_order"
  // 프로모션 및 이벤트
  | "event_card"
  | "promotion_card"
  | "button_event_participate"
  | "button_coupon_download"
  // 기타 상호작용
  | "nav_link"
  | "button_view_more"
  | "button_popup_close"
  | "signup_attempt"
  | "signup_success"
  | "login_link";

// API 요청 타입
export interface EventsRequest {
  logs: NewLogData[];
}

export interface CriticalRequest {
  logs: NewLogData[];
}
