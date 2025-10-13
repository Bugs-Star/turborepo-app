export type GoldenPathApiItem = {
  sequence: string[];
  support: number;
  successRate: number;
  coverage: number;
};

export type GoldenPathApiBucket = {
  period_type: string; // 예: "monthly"
  period_start: string; // 예: "2025-10-01"
  store_id: string | null;
  totalSessions: number;
  successSessions: number;
  top: GoldenPathApiItem[];
};

// 화면에서 쓰기 쉬운 뷰모델 타입
export type GoldenPathViewRow = {
  steps: UIStep[];
  support: number;
  coverage: number;
  successRate: number;
};

export type GoldenPathViewModel = {
  title: string; // "10월 골든 패스"
  total: number; // totalSessions
  success: number; // successSessions
  rows: GoldenPathViewRow[];
};

// 필요시 상위 N개만 노출 (중복 제거/정렬 커스텀 가능)
export function refineTop(
  items: GoldenPathApiItem[],
  max: number = 6
): GoldenPathApiItem[] {
  return items.slice(0, max);
}

/** 버킷 → 화면용 뷰모델 */
export function toViewModel(bucket: GoldenPathApiBucket): GoldenPathViewModel {
  return {
    title: monthTitle(bucket.period_start),
    total: bucket.totalSessions,
    success: bucket.successSessions,
    rows: refineTop(bucket.top).map(
      (it): GoldenPathViewRow => ({
        steps: sequenceToSteps(it.sequence),
        support: it.support,
        coverage: it.coverage,
        successRate: it.successRate,
      })
    ),
  };
}

export type StepKind =
  | "home"
  | "menu"
  | "menuDetail"
  | "event"
  | "cart"
  | "payment"
  | "login"
  | "landing"
  | "profile"
  | "other";

export type UIStep = {
  raw: string;
  kind: StepKind;
  label: string;
  sub?: string;
};

export function classifyPath(p: string): UIStep {
  if (p === "__SUCCESS__") return { raw: p, kind: "payment", label: "결제" };
  if (p === "/home") return { raw: p, kind: "home", label: "홈" };
  if (p === "/cart") return { raw: p, kind: "cart", label: "장바구니" };
  if (p.startsWith("/login")) return { raw: p, kind: "login", label: "로그인" };
  if (p.startsWith("/profile"))
    return { raw: p, kind: "profile", label: "프로필" };
  if (p.startsWith("/event/")) {
    const name = decodeURIComponent(p.split("/").pop() || "");
    return { raw: p, kind: "event", label: "이벤트", sub: name };
  }
  if (p.startsWith("/promotion/")) {
    const name = decodeURIComponent(p.split("/").pop() || "");
    return { raw: p, kind: "landing", label: "랜딩", sub: name };
  }
  if (p === "/menu") return { raw: p, kind: "menu", label: "메뉴" };
  if (p.startsWith("/menu/")) {
    const slug = p.split("/").pop() || "";
    return { raw: p, kind: "menuDetail", label: "메뉴 상세", sub: slug };
  }
  return { raw: p, kind: "other", label: "기타", sub: p };
}

export const sequenceToSteps = (seq: string[]) => seq.map(classifyPath);

// 월 제목 포맷/숫자 포맷 등 공용 유틸 (UI 독립)
export const monthTitle = (period_start: string) => {
  const d = new Date(period_start);
  return `${d.getMonth() + 1}월 골든 패스`;
};
export const pct = (v: number) => `${Math.round(v * 100)}%`;
export const num = (v: number) => new Intl.NumberFormat("ko-KR").format(v);
