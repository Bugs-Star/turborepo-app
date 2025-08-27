// 공통 타입 정의
// API 응답, 에러 처리, 폼 시스템 등에서 공통으로 사용되는 타입들

// ===== API 응답 타입 =====
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// ===== 에러 처리 타입 =====
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ErrorResponse {
  error: ApiError;
  timestamp: string;
  path: string;
}

// Axios 에러 타입 확장
export interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
      error?: string;
      details?: Record<string, unknown>;
    };
    status?: number;
    statusText?: string;
  };
  request?: unknown;
  message: string;
  config?: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
  };
}

// ===== 폼 시스템 타입 =====
export type FormFieldValue = string | number | boolean | File | null;

export interface FormField {
  value: FormFieldValue;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

export interface FormState {
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  errors: Record<string, string | undefined>;
}

export type ValidationRule = (
  value: FormFieldValue,
  allData?: Record<string, FormFieldValue>
) => string | undefined;

export interface ValidationRules {
  [field: string]: ValidationRule;
}

// ===== 이벤트 핸들링 타입 =====
export interface ClickEvent {
  target: {
    value?: string;
    checked?: boolean;
    files?: FileList;
  };
  preventDefault: () => void;
  stopPropagation: () => void;
}

export interface FormEvent {
  target: {
    elements: {
      [key: string]: {
        value: string;
        checked?: boolean;
        files?: FileList;
      };
    };
  };
  preventDefault: () => void;
}

// ===== 로깅/분석 타입 =====
export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
  userId?: string;
}

export interface InteractionEvent {
  type: string;
  target: string;
  value?: unknown;
  metadata?: Record<string, unknown>;
}

// ===== 유틸리티 타입 =====
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// ===== 제네릭 타입 =====
export type WithId<T> = T & { _id: string };

export type WithTimestamps<T> = T & {
  createdAt: string;
  updatedAt: string;
};

export type WithPagination<T> = {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
};

// ===== 상태 관리 타입 =====
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  data: unknown | null;
}

export interface AsyncState<T = unknown> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

// ===== 파일/이미지 타입 =====
export interface FileInfo {
  file: File;
  preview?: string;
  size: number;
  type: string;
  name: string;
}

export interface ImageUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

// ===== 네비게이션 타입 =====
export interface NavigationState {
  currentPath: string;
  previousPath?: string;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

// ===== 토스트/알림 타입 =====
export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  timestamp: number;
}
