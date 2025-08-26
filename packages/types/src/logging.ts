/**
 * 카페앱 로그 데이터 타입 정의
 *
 * 사용법:
 * import { LogData, EventName } from '@repo/types';
 *
 * const logData: LogData = {
 *   event_name: 'product_click',
 *   event_timestamp: new Date().toISOString(),
 *   user_id: 'user_123',
 *   device_id: 'device_456',
 *   session_id: 'sess_789',
 *   payload: { product_id: 'prod_001' }
 * };
 */

// ===== 스키마 (v2) =====

// 이벤트 타입 정의
export type NewEventName = "view_screen" | "click_interaction";

// 로그 데이터 기본 구조
export interface NewLogData {
  event_name: NewEventName;
  event_timestamp: string;
  user_id?: string;
  session_id: string;
  device_id: string;
  platform: string;
  app_version: string;
  payload: ViewScreenPayload | ClickInteractionPayload;
}

// 화면 조회 이벤트 Payload
export interface ViewScreenPayload {
  screen_name: string;
  previous_screen_name?: string;
}

// 클릭 상호작용 이벤트 Payload
export interface ClickInteractionPayload {
  interaction_type: InteractionType;
  target_id?: string;
  target_name?: string;
  source_component?: string;
  // 추가 필드들 (필요에 따라 확장)
  [key: string]: any;
}

// 상호작용 타입 상세 분류
export type InteractionType =
  // 사용자 인증/세션
  | "button_login_submit"
  | "button_signup_submit"
  | "button_logout"
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

// ===== 기존 스키마 (v1) - 하위 호환성 유지 =====

// 로그 데이터 기본 구조
export interface LogData {
  event_name: EventName;
  event_timestamp: string;
  user_id?: string;
  device_id: string;
  session_id: string;
  payload: EventPayload | CriticalPayload;
}

// 이벤트 타입 정의
export type EventName =
  // 일반 이벤트 (배치 처리)
  | "page_view"
  | "product_click"
  | "recommended_product_click"
  | "product_view"
  | "cart_add"
  | "cart_remove"
  | "cart_view"
  | "search"
  | "filter_change"
  | "scroll"
  | "order_initiate"
  | "order_complete"
  | "promotion_view"
  | "event_view"
  | "profile_edit_click"
  | "order_history_click"
  | "logout"
  | "login_attempt"
  | "login_success"
  | "login_failure"
  | "signup_link_click"
  | "signup_attempt"
  | "signup_success"
  | "signup_failure"
  | "login_link_click"

  // 중요 로그 (즉시 처리)
  | "error"
  | "critical_error"
  | "security"
  | "payment_failure"
  | "authentication_fail"
  | "performance_issue";

// 일반 이벤트 Payload
export interface EventPayload {
  // 페이지 정보
  page?: string;
  page_title?: string;
  referrer?: string;

  // 상품 정보
  product_id?: string;
  product_name?: string;
  product_price?: number;
  category?: string;

  // 장바구니 정보
  cart_total?: number;
  cart_item_count?: number;
  quantity?: number;

  // 검색 정보
  search_query?: string;
  search_results_count?: number;

  // 필터 정보
  filter_category?: string;
  filter_price_range?: string;

  // 주문 정보
  order_id?: string;
  order_total?: number;
  payment_method?: string;

  // 성능 정보
  load_time?: number;
  render_time?: number;

  // 기타
  [key: string]: any;
}

// 중요 로그 Payload
export interface CriticalPayload {
  // 에러 정보
  error_message?: string;
  error_code?: string;
  endpoint?: string;

  // 보안 정보
  security_event?: string;
  ip_address?: string;
  user_agent?: string;

  // 결제 실패 정보
  payment_method?: string;
  amount?: number;
  order_id?: string;

  // 성능 문제 정보
  load_time?: number;
  memory_usage?: number;

  // 페이지 정보
  page?: string;

  // 기타
  [key: string]: any;
}

// API 요청 타입
export interface EventsRequest {
  logs: LogData[];
}

export interface CriticalRequest {
  logs: LogData[];
}

// 배치 설정 타입
export interface BatchConfig {
  events: {
    size: number;
    timeout: number;
    retry: number;
  };
  critical: {
    size: number;
    timeout: number;
    retry: number;
  };
}

// 기본 배치 설정
export const DEFAULT_BATCH_CONFIG: BatchConfig = {
  events: {
    size: 20,
    timeout: 5000,
    retry: 3,
  },
  critical: {
    size: 5,
    timeout: 1000,
    retry: 5,
  },
};
