"use client";

import { useMemo } from "react";
import { useGetUserActivityTrend } from "@/hooks/dashboard/useGetUserActivityTrend";
import type { PeriodType, UserActivityPoint } from "@/lib/api/dashboard";
import { buildCalendarWeeks, getDayNumber, addDays } from "@/lib/week";
import { computeYMax } from "@/lib/chartFormat";

export type PeriodParams = {
  periodType: PeriodType;
  year: number;
  month?: number;
  week?: number;
};

export type ChartDatum = {
  name: string;
  rangeLabel?: string;
  tooltipLabel?: string;
  totalVisitors: number;
  uniqueVisitors: number;
  activeVisitors: number;
  bounce: number;
  _order?: number;
};

function aggregateCalendarWeekly(
  rows: ChartDatum[],
  year: number,
  month: number
): ChartDatum[] {
  const weeks = buildCalendarWeeks(year, month, true);
  const buckets: ChartDatum[] = weeks.map((w) => ({
    name: w.name,
    rangeLabel: w.rangeLabel,
    totalVisitors: 0,
    uniqueVisitors: 0,
    activeVisitors: 0,
    bounce: 0,
  }));

  for (const r of rows) {
    const day = getDayNumber(r.name);
    if (!day) continue;
    const dt = new Date(year, month - 1, day);
    const idx = weeks.findIndex((w) => dt >= w.start && dt <= w.end);
    if (idx >= 0) {
      buckets[idx].totalVisitors += r.totalVisitors;
      buckets[idx].uniqueVisitors += r.uniqueVisitors;
      buckets[idx].activeVisitors += r.activeVisitors;
      buckets[idx].bounce += r.bounce;
    }
  }
  return buckets;
}

function expandSelectedWeekToDays(
  rows: ChartDatum[],
  year: number,
  month: number,
  weekIndex: number
): ChartDatum[] {
  const weeks = buildCalendarWeeks(year, month, true);
  const target = weeks[weekIndex] ?? weeks[weeks.length - 1];
  if (!target) return [];

  const days: ChartDatum[] = [];
  for (let d = new Date(target.start); d <= target.end; d = addDays(d, 1)) {
    const dayNum = d.getDate();
    const key = `${dayNum}일`;
    const found = rows.find((r) => r.name === key);
    days.push({
      name: key,
      tooltipLabel: `${d.getMonth() + 1}/${dayNum}`,
      totalVisitors: found?.totalVisitors ?? 0,
      uniqueVisitors: found?.uniqueVisitors ?? 0,
      activeVisitors: found?.activeVisitors ?? 0,
      bounce: found?.bounce ?? 0,
    });
  }
  return days;
}

export function useUserActivityChart(params: PeriodParams) {
  const query = useGetUserActivityTrend({
    periodType: params.periodType,
    year: params.year,
    month: params.periodType !== "yearly" ? params.month : undefined,
    week: params.periodType === "weekly" ? params.week : undefined,
  });

  const chartData: ChartDatum[] = useMemo(() => {
    const normalized: ChartDatum[] = (query.data ?? []).map(
      (d: UserActivityPoint) => ({
        name: String(d.name ?? ""),
        totalVisitors: Number(d.totalVisitors ?? 0),
        uniqueVisitors: Number(d.uniqueVisitors ?? 0),
        activeVisitors: Number(d.activeVisitors ?? 0),
        bounce: Number(d.bounce ?? 0),
        _order: Number(String(d.name).replace(/\D+/g, "")) || 0,
      })
    );

    if (params.periodType === "yearly") {
      const sums = normalized.reduce(
        (acc, cur) => ({
          totalVisitors: acc.totalVisitors + cur.totalVisitors,
          uniqueVisitors: acc.uniqueVisitors + cur.uniqueVisitors,
          activeVisitors: acc.activeVisitors + cur.activeVisitors,
          bounce: acc.bounce + cur.bounce,
        }),
        { totalVisitors: 0, uniqueVisitors: 0, activeVisitors: 0, bounce: 0 }
      );
      return [
        {
          name: `${params.year}년`,
          rangeLabel: `${params.year}/1–${params.year}/12`,
          ...sums,
        },
      ];
    }

    if (params.periodType === "weekly" && params.month) {
      if (params.week) {
        const idx = Math.max(1, Math.min(5, params.week)) - 1;
        return expandSelectedWeekToDays(
          normalized,
          params.year,
          params.month,
          idx
        );
      }
      return aggregateCalendarWeekly(normalized, params.year, params.month);
    }

    if (params.periodType === "monthly") {
      const weeks = ["1주", "2주", "3주", "4주"];
      return weeks.map((w) => {
        const f = normalized.find((r) => r.name === w);
        return (
          f ?? {
            name: w,
            rangeLabel: w,
            totalVisitors: 0,
            uniqueVisitors: 0,
            activeVisitors: 0,
            bounce: 0,
          }
        );
      });
    }

    normalized.sort((a, b) => (a._order ?? 0) - (b._order ?? 0));
    return normalized;
  }, [query.data, params.periodType, params.year, params.month, params.week]);

  const isSingleCategory = chartData.length === 1;
  const weeklyDayMode = params.periodType === "weekly" && !!params.week;
  const xKey: "name" | "rangeLabel" =
    params.periodType === "weekly" && !params.week ? "rangeLabel" : "name";
  const yMax = computeYMax(chartData);

  return { ...query, chartData, isSingleCategory, weeklyDayMode, xKey, yMax };
}
