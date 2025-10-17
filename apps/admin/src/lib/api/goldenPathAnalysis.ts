// lib/api/goldenPathAnalysis.ts
import type {
  GoldenPathApiBucket,
  GoldenPathApiItem,
  GoldenPathApiByItem,
} from "@/hooks/dashboard/useGetGoldenPath";

export type StepKind =
  | "home"
  | "menu"
  | "menuDetail"
  | "event"
  | "cart"
  | "payment"
  | "login"
  | "promotion"
  | "profile"
  | "other";

export type ViewStep = {
  raw: string;
  kind: StepKind;
  label: string;
  sub?: string;
};

export type ViewRow = {
  steps: ViewStep[];
  support: number;
  coverage: number;
  successRate: number;
};

export type ViewByItem = {
  item: string;
  totalSessions: number;
  rows: ViewRow[];
};

export type ViewModel = {
  title: string;
  total: number;
  success: number;
  rows: ViewRow[]; // 전체 골든패스
  byItem?: ViewByItem[]; // Top3 상품별 골든패스
};

// ---- helpers ----
function parseStep(raw: string): ViewStep {
  const r = raw || "";

  if (
    r === "__SUCCESS__" ||
    r.startsWith("/payment-complete") ||
    r.startsWith("/payment")
  )
    return { raw: r, kind: "payment", label: "결제" };

  if (r === "/cart") return { raw: r, kind: "cart", label: "장바구니" };
  if (r === "/menu") return { raw: r, kind: "menu", label: "메뉴" };
  if (r.startsWith("/menu/")) {
    const id = decodeURIComponent(r.split("/").pop() || "");
    return { raw: r, kind: "menuDetail", label: "메뉴 상세", sub: id };
  }

  if (r === "/home") return { raw: r, kind: "home", label: "홈" };
  if (r === "/login") return { raw: r, kind: "login", label: "로그인" };
  if (r === "/profile") return { raw: r, kind: "profile", label: "프로필" };

  if (r.startsWith("/event/")) {
    const slug = decodeURIComponent(r.split("/").pop() || "");
    return { raw: r, kind: "event", label: "이벤트", sub: slug };
  }
  if (r.startsWith("/promotion/")) {
    const slug = decodeURIComponent(r.split("/").pop() || "");
    return { raw: r, kind: "promotion", label: "프로모션", sub: slug };
  }

  // 랜딩 기타
  return { raw: r, kind: "other", label: "기타", sub: r.replace(/^\//, "") };
}

function toViewRow(i: GoldenPathApiItem): ViewRow {
  return {
    steps: (i.sequence || []).map(parseStep),
    support: i.support ?? 0,
    coverage: i.coverage ?? 0,
    successRate: i.successRate ?? 0,
  };
}

function formatTitle(period_type: string, period_start: string) {
  try {
    const d = new Date(period_start);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    if (period_type === "monthly") return `${y}년 ${m}월`;
    if (period_type === "weekly") return `${y}년 ${m}월 주간`;
    if (period_type === "yearly") return `${y}년`;
  } catch {}
  return `${period_start} (${period_type})`;
}

// ---- public ----
export function toViewModel(bucket: GoldenPathApiBucket): ViewModel {
  const rows = (bucket.top || []).map(toViewRow);

  // Top3 상품별 (API가 내려준 경우에만)
  const byItem: ViewByItem[] | undefined = bucket.topByItem?.map(
    (bi: GoldenPathApiByItem) => ({
      item: bi.item,
      totalSessions: bi.totalSessions,
      rows: (bi.top || []).map(toViewRow),
    })
  );

  return {
    title: formatTitle(bucket.period_type, bucket.period_start),
    total: bucket.totalSessions,
    success: bucket.successSessions,
    rows,
    byItem,
  };
}
