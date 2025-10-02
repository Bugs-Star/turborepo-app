"use client";

import {
  useQuery,
  type UseQueryResult,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  PromoService,
  type MonthlyPromosParams,
  type MonthlyPromosResponse,
  type PromoResponse,
  type ViewTrendPoint,
  type ClickTrendPoint,
} from "@/lib/api/promo";

/** ChartCard가 기대하는 포맷 */
export interface ChartPoint {
  name: string; // "1주" ~
  value: number;
}

export interface PromoQueryResult {
  promotions: PromoResponse[];
  viewSeries: ChartPoint[];
  clickSeries: ChartPoint[];
  meta: MonthlyPromosResponse["meta"];
}

/* ========= 달력 유틸 (일요일 시작) ========= */
function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}
function startOfWeekSun(d: Date): Date {
  return addDays(d, -d.getDay()); // Sun=0
}
function weeksInMonthSunStart(year: number, month: number): number {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  let cur = startOfWeekSun(monthStart);
  let count = 0;
  while (cur <= monthEnd) {
    count += 1;
    cur = addDays(cur, 7);
  }
  return Math.min(6, Math.max(4, count)); // 통상 4~6주 표시
}

/* ========= 시리즈 보정 ========= */
function normalizeWeeklySeries<T extends { name: string }>(
  points: ReadonlyArray<T>,
  getValue: (p: T) => number,
  totalWeeks: number
): ChartPoint[] {
  const byWeek = new Map<number, number>();
  for (const p of points) {
    const n = parseInt(String(p.name).replace(/\D+/g, ""), 10);
    if (Number.isFinite(n) && n > 0) byWeek.set(n, getValue(p));
  }

  const out: ChartPoint[] = [];
  for (let w = 1; w <= totalWeeks; w++) {
    out.push({ name: `${w}주`, value: byWeek.get(w) ?? 0 });
  }
  return out;
}

/* ========= 단위 변환 ========= */
/** 서버가 초 단위로 내려줄 경우 분으로 변환(이미 분이면 아래 나누기 제거) */
function toMinutes(secondsOrMinutes: number): number {
  return Math.round((secondsOrMinutes ?? 0) / 60);
}

export function useGetPromoData(
  params: MonthlyPromosParams
): UseQueryResult<PromoQueryResult, Error> {
  const { year, month } = params;
  const key = ["promotions-monthly", year, month] as const;

  return useQuery<
    MonthlyPromosResponse, // TQueryFnData (raw 응답)
    Error, // TError
    PromoQueryResult, // TData (select 이후의 형태)
    typeof key // TQueryKey
  >({
    queryKey: key,
    queryFn: () => PromoService.getMonthlyPromos({ year, month }),
    placeholderData: keepPreviousData,
    select: (res): PromoQueryResult => {
      const totalWeeks = weeksInMonthSunStart(year, month);

      const viewSeries = normalizeWeeklySeries<ViewTrendPoint>(
        res.viewTrendData ?? [],
        (p) => toMinutes(p.viewDuration),
        totalWeeks
      );

      const clickSeries = normalizeWeeklySeries<ClickTrendPoint>(
        res.clickTrendData ?? [],
        (p) => Number(p.clicks ?? 0),
        totalWeeks
      );

      return {
        promotions: res.promotions ?? [],
        viewSeries,
        clickSeries,
        meta: res.meta,
      };
    },
  });
}
