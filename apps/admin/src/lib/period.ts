export type PeriodType = "yearly" | "monthly" | "weekly";

export type PeriodParams = {
  periodType: PeriodType;
  year: number;
  month?: number; // 1..12
  week?: number; // 1..53 (ISO)
};

// ---------- 날짜 유틸 ----------
const pad2 = (n: number): string => (n < 10 ? `0${n}` : `${n}`);
const ymd = (y: number, m: number, d: number): string =>
  `${y}-${pad2(m)}-${pad2(d)}`;

const nextMonthStart = (y: number, m: number): { y: number; m: number } =>
  m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 };

const addDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
};

// ISO week: 1월 4일이 속한 주가 Week 1, 월요일 시작
const isoWeekStart = (year: number, week: number): Date => {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const day = jan4.getUTCDay() || 7; // 일요일=0 → 7
  const mondayOfWeek1 = new Date(jan4);
  mondayOfWeek1.setUTCDate(jan4.getUTCDate() - (day - 1));
  const d = new Date(mondayOfWeek1);
  d.setUTCDate(mondayOfWeek1.getUTCDate() + (week - 1) * 7);
  return d;
};

const toYMD = (date: Date): string => {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  return ymd(y, m, d);
};

// ---------- 위젯들이 쓰기 쉬운 공통 Range ----------
export type DateRange = { from: string; to: string };

export function periodToRange(p: PeriodParams): DateRange {
  if (p.periodType === "monthly") {
    const y = p.year;
    const m = p.month ?? 1;
    const { y: ny, m: nm } = nextMonthStart(y, m);
    return { from: ymd(y, m, 1), to: ymd(ny, nm, 1) };
  }
  if (p.periodType === "yearly") {
    const y = p.year;
    return { from: ymd(y, 1, 1), to: ymd(y + 1, 1, 1) };
  }
  // weekly
  const w = p.week ?? 1;
  const start = isoWeekStart(p.year, w);
  const end = addDays(start, 7);
  return { from: toYMD(start), to: toYMD(end) };
}
