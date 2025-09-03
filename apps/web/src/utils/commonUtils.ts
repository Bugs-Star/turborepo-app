/**
 * 공통 유틸리티 함수들
 * 프로젝트 전반에서 사용되는 범용 함수들
 */

/**
 * CSS 클래스명을 조건부로 결합하는 유틸리티 함수
 * @param classes - 결합할 클래스명들 (falsy 값은 자동으로 제외됨)
 * @returns 결합된 클래스명 문자열
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * 객체의 키가 존재하는지 확인하는 타입 가드
 * @param obj - 확인할 객체
 * @param key - 확인할 키
 * @returns 키가 존재하는지 여부
 */
export function hasKey<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return obj !== null && typeof obj === "object" && key in obj;
}

/**
 * 안전한 숫자 변환 함수
 * @param value - 변환할 값
 * @param fallback - 변환 실패 시 기본값
 * @returns 변환된 숫자 또는 기본값
 */
export function safeNumber(value: unknown, fallback: number = 0): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

/**
 * 안전한 문자열 변환 함수
 * @param value - 변환할 값
 * @param fallback - 변환 실패 시 기본값
 * @returns 변환된 문자열 또는 기본값
 */
export function safeString(value: unknown, fallback: string = ""): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
}

/**
 * 배열이 비어있는지 확인하는 함수
 * @param arr - 확인할 배열
 * @returns 배열이 비어있는지 여부
 */
export function isEmptyArray(arr: unknown): arr is never[] {
  return Array.isArray(arr) && arr.length === 0;
}

/**
 * 객체가 비어있는지 확인하는 함수
 * @param obj - 확인할 객체
 * @returns 객체가 비어있는지 여부
 */
export function isEmptyObject(obj: unknown): obj is Record<string, never> {
  return (
    obj !== null && typeof obj === "object" && Object.keys(obj).length === 0
  );
}
