export type PeriodType = "yearly" | "monthly" | "weekly";

export type PeriodParams = {
  periodType: PeriodType;
  year: number;
  month?: number; // 1..12
  week?: number; // 1..53 (ISO 또는 월보기에선 1..5)
};

// ---------- 공통 유틸 ----------
const pad2 = (n: number): string => (n < 10 ? `0${n}` : `${n}`);
const ymd = (y: number, m: number, d: number): string =>
  `${y}-${pad2(m)}-${pad2(d)}`;

// UTC Date → 'YYYY-MM-DD'
const toYMD = (date: Date): string =>
  ymd(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());

// days 만큼 더하기 (UTC 기준 날짜 +N일)
const addDaysUTC = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
};

// 다음달 1일(UTC Date 객체)
const nextMonthStartUTC = (y: number, m: number): Date =>
  new Date(Date.UTC(m === 12 ? y + 1 : y, m === 12 ? 0 : m, 1));

// 해당 월의 말일(YYYY-MM-DD) 계산 (m: 1..12)
const lastDayOfMonthYMD = (y: number, m: number): string => {
  // (m+1월의 0일) = m월의 마지막 날
  const d = new Date(Date.UTC(y, m, 0));
  return toYMD(d);
};

// ✅ 한국시간(UTC+9)
const TZ_OFFSET_MIN = 9 * 60;

// KST 기준 "그 날짜가 속한 주의 월요일 00:00"을 UTC로 반환
const startOfWeekKST = (utcDate: Date): Date => {
  const local = new Date(utcDate.getTime() + TZ_OFFSET_MIN * 60_000);
  const day = local.getDay() || 7; // Sun=0 → 7
  const mondayLocal = new Date(local);
  mondayLocal.setDate(local.getDate() - (day - 1));
  return new Date(mondayLocal.getTime() - TZ_OFFSET_MIN * 60_000);
};

// (백업) ISO week-of-year 시작(UTC)
const isoWeekStartUTC = (year: number, week: number): Date => {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const day = jan4.getUTCDay() || 7;
  const mondayOfWeek1 = new Date(jan4);
  mondayOfWeek1.setUTCDate(jan4.getUTCDate() - (day - 1));
  const start = new Date(mondayOfWeek1);
  start.setUTCDate(mondayOfWeek1.getUTCDate() + (week - 1) * 7);
  return start;
};

// ---------- 반환 타입 ----------
export type DateRange = { from: string; to: string };

export function periodToRange(p: PeriodParams): DateRange {
  // 월별: 해당 월 1일 ~ 해당 월 "말일" (포함 표시용)
  if (p.periodType === "monthly") {
    const y = p.year;
    const m = p.month ?? 1;
    return { from: ymd(y, m, 1), to: lastDayOfMonthYMD(y, m) };
  }

  // 연별: 해당 해 1월1일 ~ 해당 해 12월31일 (포함 표시용)
  if (p.periodType === "yearly") {
    const y = p.year;
    return { from: ymd(y, 1, 1), to: ymd(y, 12, 31) };
  }

  // ── weekly ────────────────────────────────────────────────
  if (p.periodType === "weekly") {
    const w = p.week ?? 1;

    if (p.month) {
      // ✅ 월 보기: "그 달" 안으로 주간 범위를 CLIP
      const monthStartUTC = new Date(Date.UTC(p.year, p.month - 1, 1)); // YYYY-MM-01 00:00 UTC
      const monthEndExclusiveUTC = nextMonthStartUTC(p.year, p.month); // 다음달 1일 00:00 UTC (상한 미포함)

      // 그 달 1일이 속한 주의 월요일(KST 기준)을 베이스로 w주차 계산
      const baseMondayUTC = startOfWeekKST(monthStartUTC);
      const weekStartUTC = addDaysUTC(baseMondayUTC, (w - 1) * 7); // 해당 주 시작(UTC)
      const weekEndUTC = addDaysUTC(weekStartUTC, 7); // 다음주 월요일(UTC)

      // 🔒 달 경계로 CLIP: 시작은 달 시작 이상, 끝은 달 끝(다음달 1일) 이하
      const clippedFromUTC =
        weekStartUTC < monthStartUTC ? monthStartUTC : weekStartUTC;
      const clippedToUTC =
        weekEndUTC > monthEndExclusiveUTC ? monthEndExclusiveUTC : weekEndUTC;

      // 보호: 역전되면 빈 구간 반환(호출측에서 숨기기)
      if (clippedFromUTC >= clippedToUTC) {
        return { from: toYMD(monthStartUTC), to: toYMD(monthStartUTC) };
      }

      // 항상 [from, to) 형태로 사용 (표시는 to-1일)
      return { from: toYMD(clippedFromUTC), to: toYMD(clippedToUTC) };
    }

    // (백업) month가 없으면 ISO week-of-year + KST 보정
    const isoStart = isoWeekStartUTC(p.year, w);
    const start = startOfWeekKST(isoStart);
    const end = addDaysUTC(start, 7);
    return { from: toYMD(start), to: toYMD(end) };
  }

  // 기본(안 들어올 케이스) — 안전하게 0범위
  const d = new Date(Date.UTC(p.year, (p.month ?? 1) - 1, 1));
  return { from: toYMD(d), to: toYMD(d) };
}

/**
 * 서버에서 상한 미포함 비교(`ts < toExclusive`)에 쓰기 위한 헬퍼.
 * - monthly/yearly의 `to`(말일)를 -> 다음날로 +1 해서 안전한 upper bound로 변환
 * - weekly는 이미 to가 exclusive 형태이므로 그대로 사용해도 됨
 */
export function toExclusiveUpperBound(toYmdInclusive: string): string {
  const [y, m, d] = toYmdInclusive.split("-").map(Number);
  const next = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  next.setUTCDate(next.getUTCDate() + 1);
  return toYMD(next);
}
