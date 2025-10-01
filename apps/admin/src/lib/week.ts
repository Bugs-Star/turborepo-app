// apps/admin/src/lib/date/week.ts
export const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const clamp = (d: Date, min: Date, max: Date) =>
  d < min ? min : d > max ? max : d;

/** 일요일 시작 주의 시작/끝 */
export function startOfWeekSun(d: Date) {
  const day = d.getDay(); // Sun=0..Sat=6
  return addDays(d, -day);
}
export function endOfWeekSun(d: Date) {
  const s = startOfWeekSun(d);
  return addDays(s, 6); // 토요일
}

export const fmtMDRange = (s: Date, e: Date) =>
  `${s.getMonth() + 1}/${s.getDate()}–${e.getMonth() + 1}/${e.getDate()}`;

export const getDayNumber = (label: string) => {
  const n = parseInt(String(label).replace(/\D+/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

export type WeekSlot = {
  name: string;
  start: Date;
  end: Date;
  rangeLabel: string;
};

/** 달력 주 생성(일요일 시작). 6주면 5주차에 합산해 1~5주 고정 */
export function buildCalendarWeeks(
  year: number,
  month: number,
  compressTo5 = true
): WeekSlot[] {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  let cursor = startOfWeekSun(monthStart);

  const weeks: WeekSlot[] = [];
  while (cursor <= monthEnd) {
    const wStart = cursor;
    const wEnd = endOfWeekSun(cursor);
    const clippedStart = clamp(wStart, monthStart, monthEnd);
    const clippedEnd = clamp(wEnd, monthStart, monthEnd);
    weeks.push({
      name: "",
      start: clippedStart,
      end: clippedEnd,
      rangeLabel: fmtMDRange(clippedStart, clippedEnd),
    });
    cursor = addDays(cursor, 7);
  }

  if (compressTo5 && weeks.length === 6) {
    const w5 = weeks[4],
      w6 = weeks[5];
    w5.end = w6.end;
    w5.rangeLabel = fmtMDRange(w5.start, w5.end);
    weeks.splice(5, 1);
  }

  weeks.forEach((w, i) => (w.name = `${i + 1}주`));
  return weeks;
}
