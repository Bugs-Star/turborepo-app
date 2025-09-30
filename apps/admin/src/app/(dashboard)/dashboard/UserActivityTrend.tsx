"use client";

import { useMemo } from "react";
import type { PeriodType } from "@/lib/api/dashboard";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";
import { useGetUserActivityTrend } from "@/hooks/dashboard/useGetUserActivityTrend";

type PeriodParams = {
  periodType: PeriodType;
  year: number;
  month?: number;
  week?: number;
};

type Props = {
  params: PeriodParams;
  title?: string;
  subtitle?: string;
  className?: string;
  height?: number;
};

const NUM = new Intl.NumberFormat("ko-KR");

/* ===== 날짜 유틸 (일요일 시작 주) ===== */
const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const clamp = (d: Date, min: Date, max: Date) =>
  d < min ? min : d > max ? max : d;

/** startOfWeek: 일요일로 이동 (Sun=0) */
function startOfWeekSun(d: Date) {
  const day = d.getDay(); // 0..6 (Sun..Sat)
  return addDays(d, -day);
}
function endOfWeekSun(d: Date) {
  const s = startOfWeekSun(d);
  return addDays(s, 6); // 토요일
}
const fmtRange = (s: Date, e: Date) =>
  `${s.getMonth() + 1}/${s.getDate()}–${e.getMonth() + 1}/${e.getDate()}`;
/** "28일" -> 28 */
const getDayNumber = (label: string) => {
  const n = parseInt(String(label).replace(/\D+/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

function buildCalendarWeeks(year: number, month: number, compressTo5 = true) {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  // 🔁 일요일 시작 주로 커서 이동
  let cursor = startOfWeekSun(monthStart);

  const weeks: { name: string; start: Date; end: Date; rangeLabel: string }[] =
    [];

  while (cursor <= monthEnd) {
    const wStart = cursor;
    const wEnd = endOfWeekSun(cursor);
    const clippedStart = clamp(wStart, monthStart, monthEnd);
    const clippedEnd = clamp(wEnd, monthStart, monthEnd);
    weeks.push({
      name: "",
      start: clippedStart,
      end: clippedEnd,
      rangeLabel: fmtRange(clippedStart, clippedEnd),
    });
    cursor = addDays(cursor, 7);
  }

  // 6주 달은 5주차에 합산해 1~5주만 유지
  if (compressTo5 && weeks.length === 6) {
    const w5 = weeks[4];
    const w6 = weeks[5];
    w5.end = w6.end;
    w5.rangeLabel = fmtRange(w5.start, w5.end);
    weeks.splice(5, 1);
  }

  weeks.forEach((w, i) => (w.name = `${i + 1}주`));
  return weeks;
}

/** 주별 합산 (주 미선택 시 사용) */
function aggregateCalendarWeekly(
  rows: Array<{
    name: string;
    totalVisitors: number;
    uniqueVisitors: number;
    activeVisitors: number;
    bounce: number;
  }>,
  year: number,
  month: number
) {
  const weeks = buildCalendarWeeks(year, month, true);
  const buckets = weeks.map((w) => ({
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

/** 선택된 특정 주를 ‘일자 리스트’로 전개 (없는 날은 0으로 채움) */
function expandSelectedWeekToDays(
  rows: Array<{
    name: string;
    totalVisitors: number;
    uniqueVisitors: number;
    activeVisitors: number;
    bounce: number;
  }>,
  year: number,
  month: number,
  weekIndex: number // 0-based (0..4)
) {
  const weeks = buildCalendarWeeks(year, month, true);
  const target = weeks[weekIndex] ?? weeks[weeks.length - 1];
  if (!target) return [];

  const days: {
    name: string; // "28일"
    tooltipLabel: string; // "9/28"
    totalVisitors: number;
    uniqueVisitors: number;
    activeVisitors: number;
    bounce: number;
  }[] = [];

  for (let d = new Date(target.start); d <= target.end; d = addDays(d, 1)) {
    const dayNum = d.getDate();
    const key = `${dayNum}일`;
    const found = rows.find((r) => r.name === key);
    days.push({
      name: key,
      tooltipLabel: `${d.getMonth() + 1}/${dayNum}`,
      totalVisitors: found ? found.totalVisitors : 0,
      uniqueVisitors: found ? found.uniqueVisitors : 0,
      activeVisitors: found ? found.activeVisitors : 0,
      bounce: found ? found.bounce : 0,
    });
  }
  return days;
}

export default function UserActivityTrend({
  params,
  title,
  subtitle,
  className = "",
  height = 300,
}: Props) {
  const { data, isLoading, isFetching, isError } = useGetUserActivityTrend({
    periodType: params.periodType,
    year: params.year,
    month: params.periodType !== "yearly" ? params.month : undefined,
    week: params.periodType === "weekly" ? params.week : undefined,
  });

  // 0이면 라벨 숨김
  const fmtLabel = (label: unknown) => {
    const n = typeof label === "number" ? label : Number(label ?? 0);
    return n > 0 ? NUM.format(n) : "";
  };

  // ===== periodType별 데이터 구성 =====
  const chartData = useMemo(() => {
    const normalized = (data ?? []).map((d) => ({
      name: String(d.name ?? ""),
      totalVisitors: Number((d as any).totalVisitors ?? 0),
      uniqueVisitors: Number((d as any).uniqueVisitors ?? 0),
      activeVisitors: Number((d as any).activeVisitors ?? 0),
      bounce: Number((d as any).bounce ?? 0),
      _order: Number(String(d.name).replace(/\D+/g, "")) || 0,
    }));

    // YEARLY: 전체 합계를 하나로
    if (params.periodType === "yearly") {
      const sums = normalized.reduce(
        (acc, cur) => {
          acc.totalVisitors += cur.totalVisitors;
          acc.uniqueVisitors += cur.uniqueVisitors;
          acc.activeVisitors += cur.activeVisitors;
          acc.bounce += cur.bounce;
          return acc;
        },
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

    // WEEKLY: 주 선택 시 → 그 주의 ‘일자별’(예: 28/29/30)로 전개
    if (params.periodType === "weekly" && params.month) {
      if (params.week) {
        // 1~5 → 0~4 index
        const idx = Math.max(1, Math.min(5, params.week)) - 1;
        return expandSelectedWeekToDays(
          normalized,
          params.year,
          params.month,
          idx
        );
      }
      // 주 미선택이면 주별 합산(1~5주)
      return aggregateCalendarWeekly(normalized, params.year, params.month);
    }

    // MONTHLY: 1~4주 고정 슬롯
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

    // 기타
    normalized.sort((a, b) => a._order - b._order);
    return normalized;
  }, [data, params.periodType, params.year, params.month, params.week]);

  const monthText =
    params.periodType === "monthly" && params.month ? `${params.month}월` : "";
  const defaultTitle =
    title ??
    (params.periodType === "yearly"
      ? `${params.year}년 사용자 활동 추세`
      : params.periodType === "monthly"
        ? `${monthText} 사용자 활동 추세`
        : `사용자 활동 추세`);
  const defaultSubtitle =
    subtitle ??
    (params.periodType === "yearly"
      ? `${params.year}년 총 방문자, 순 방문자, 활성 방문자, 이탈자`
      : params.periodType === "monthly"
        ? `${monthText} 총 방문자, 순 방문자, 활성 방문자, 이탈자`
        : `총 방문자, 순 방문자, 활성 방문자, 이탈자`);

  // weekly일 때: 주 선택 시 일자 라벨(name), 미선택 시 날짜범위(rangeLabel)
  const useRangeLabel = params.periodType === "weekly" && !params.week;
  const xKey = useRangeLabel ? "rangeLabel" : "name";

  // 단일 카테고리 중앙 정렬(연간 합계 등)
  const isSingleCategory = chartData.length === 1;

  // ✅ y축 상단 여유치 계산
  const yMax = useMemo(() => {
    const max = Math.max(
      0,
      ...chartData.map((d: any) =>
        Math.max(
          Number(d.totalVisitors ?? 0),
          Number(d.uniqueVisitors ?? 0),
          Number(d.activeVisitors ?? 0),
          Number(d.bounce ?? 0)
        )
      )
    );
    // 최소 1만큼, 보통 15% 여유
    const pad = Math.max(1, Math.ceil(max * 0.1));
    return max + pad;
  }, [chartData]);

  return (
    <div
      className={`rounded-2xl border border-border bg-card text-foreground p-5 shadow-sm mt-10 ${className}`}
    >
      {/* 헤더 */}
      <div className="mb-3">
        <div className="text-base font-semibold">{defaultTitle}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {defaultSubtitle}
        </div>
      </div>

      {/* 로딩/에러 */}
      {isLoading && (
        <div className="h-[300px] rounded-xl bg-muted animate-pulse" />
      )}
      {isError && !isLoading && (
        <div className="text-sm text-danger">
          사용자 활동 데이터를 불러오지 못했습니다.
        </div>
      )}

      {/* 차트 */}
      {!isLoading && !isError && chartData.length > 0 && (
        <>
          <div
            className={`${isSingleCategory ? "max-w-[560px] mx-auto" : ""}`}
            style={{ width: "100%", height }}
          >
            <ResponsiveContainer>
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                barCategoryGap={isSingleCategory ? 64 : 28}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.35} />
                <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
                <YAxis
                  domain={[0, yMax]}
                  tickFormatter={(v) => NUM.format(v as number)}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  // 주 선택(일자 뷰)이면 "M/D"로, 아니면 X축 라벨 그대로
                  labelFormatter={(label, payload) => {
                    if (params.periodType === "weekly" && params.week) {
                      // chartData에 tooltipLabel이 있으면 사용, 없으면 가공
                      const p = payload?.[0]?.payload as any;
                      if (p?.tooltipLabel) return p.tooltipLabel;
                      const num =
                        typeof label === "string" ? getDayNumber(label) : 0;
                      return params.month
                        ? `${params.month}/${num}`
                        : String(label ?? "");
                    }
                    return typeof label === "string" ? label : "";
                  }}
                  formatter={(val: number, key: string) => [
                    NUM.format(val),
                    legendLabel(key),
                  ]}
                  labelClassName="text-sm"
                  contentStyle={{ borderRadius: 12 }}
                />

                {/* 총 방문자(녹색) */}
                <Bar
                  dataKey="totalVisitors"
                  radius={[6, 6, 0, 0]}
                  fill="#1E7D32"
                >
                  <LabelList
                    dataKey="totalVisitors"
                    position="top"
                    formatter={(v) =>
                      Number(v ?? 0) > 0 ? NUM.format(Number(v)) : ""
                    }
                    className="fill-[#1E7D32]"
                  />
                </Bar>

                {/* 순 방문자(남색) */}
                <Bar
                  dataKey="uniqueVisitors"
                  radius={[6, 6, 0, 0]}
                  fill="#1F4E79"
                >
                  <LabelList
                    dataKey="uniqueVisitors"
                    position="top"
                    formatter={(v) =>
                      Number(v ?? 0) > 0 ? NUM.format(Number(v)) : ""
                    }
                    className="fill-[#1F4E79]"
                  />
                </Bar>

                {/* 활성 방문자(노랑) */}
                <Bar
                  dataKey="activeVisitors"
                  radius={[6, 6, 0, 0]}
                  fill="#C28E00"
                >
                  <LabelList
                    dataKey="activeVisitors"
                    position="top"
                    formatter={(v) =>
                      Number(v ?? 0) > 0 ? NUM.format(Number(v)) : ""
                    }
                    className="fill-[#C28E00]"
                  />
                </Bar>

                {/* 이탈자(빨강) */}
                <Bar dataKey="bounce" radius={[6, 6, 0, 0]} fill="#C0392B">
                  <LabelList
                    dataKey="bounce"
                    position="top"
                    formatter={(v) =>
                      Number(v ?? 0) > 0 ? NUM.format(Number(v)) : ""
                    }
                    className="fill-[#C0392B]"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 범례/주석/페칭 안내는 기존 그대로 */}
        </>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span>{label}</span>
    </span>
  );
}

function legendLabel(key: string) {
  if (key === "totalVisitors") return "총 방문자 수";
  if (key === "uniqueVisitors") return "순 방문자 수";
  if (key === "activeVisitors") return "활성 방문자 수";
  if (key === "bounce") return "이탈자 수";
  return key;
}
