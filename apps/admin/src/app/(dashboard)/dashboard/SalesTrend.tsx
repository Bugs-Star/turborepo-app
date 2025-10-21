"use client";

import { useMemo } from "react";
import type { PeriodType } from "@/lib/api/dashboard";
import { useGetSalesTrend } from "@/hooks/dashboard/useGetSalesTrend";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { isAxiosError } from "axios";

const KRW = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("ko-KR");

type PeriodParams = {
  periodType: PeriodType;
  year: number;
  month?: number;
  week?: number;
};

type Props = {
  params: PeriodParams;
  className?: string;
  height?: number; // 차트 영역 높이
};

/** 에러 메시지 파서: 404는 고정 문구, 그 외는 서버/클라 메시지 노출 */
function parseErrorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) {
    const status = error.response?.status;
    if (status === 404) return "매출 트렌드 데이터가 없습니다.";
    return (
      error.response?.data?.message ||
      error.message ||
      "요청 중 오류가 발생했습니다."
    );
  }
  if (error instanceof Error)
    return error.message || "알 수 없는 오류가 발생했습니다.";
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "알 수 없는 오류가 발생했습니다.";
  }
}

export default function SalesTrend({
  params,
  className = "",
  height = 220,
}: Props) {
  const {
    data,
    isLoading,
    isFetching: _isFetching,
    isError,
    error,
  } = useGetSalesTrend({
    periodType: params.periodType,
    year: params.year,
    month: params.periodType !== "yearly" ? params.month : undefined,
    week: params.periodType === "weekly" ? params.week : undefined,
  });

  // 차트/테이블 공용 데이터
  const chartData = useMemo(() => {
    const arr = (data ?? []).map((d) => ({
      name: d.name,
      sales: d.sales ?? 0,
    }));
    // 주차/일자 label 정렬 보정 (숫자 우선)
    const num = (s: string) => Number(String(s).replace(/\D+/g, "")) || 0;
    return arr.sort((a, b) => num(a.name) - num(b.name));
  }, [data]);

  // 총합/평균/직전대비 변동
  const { total, average, lastDiff } = useMemo(() => {
    const total = chartData.reduce((s, x) => s + (x.sales ?? 0), 0);
    const average = chartData.length ? Math.round(total / chartData.length) : 0;
    const last = chartData.at(-1)?.sales ?? 0;
    const prev = chartData.at(-2)?.sales ?? 0;
    const lastDiff = last - prev; // 양수=상승, 음수=하락
    return { total, average, lastDiff };
  }, [chartData]);

  const titlePrefix =
    params.periodType === "yearly"
      ? `${params.year}년`
      : params.periodType === "monthly" && params.month
        ? `${params.month}월`
        : params.periodType === "weekly" && params.month && params.week
          ? `${params.month}월 ${params.week}주`
          : "";

  const errorMsg = isError ? parseErrorMessage(error) : "";

  const compact = new Intl.NumberFormat("en-US", { notation: "compact" });

  return (
    <div
      className={`rounded-2xl border border-border bg-card text-foreground p-5 shadow-sm mt-10 ${className}`}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-base font-semibold">매출 트렌드</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            구간별 매출 흐름{titlePrefix ? ` — ${titlePrefix}` : ""}
          </div>
        </div>
      </div>

      {/* 상태 */}
      {isLoading && (
        <div className="space-y-3">
          <div className="h-[220px] bg-muted rounded-xl animate-pulse" />
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="h-8 bg-muted rounded animate-pulse" />
        </div>
      )}

      {isError && <div className="text-sm text-danger">{errorMsg}</div>}

      {/* 본문 (차트) */}
      {!isLoading && !isError && (
        <>
          {chartData.length ? (
            <div style={{ width: "100%", height }} className="mb-4">
              <ResponsiveContainer>
                <AreaChart
                  data={chartData}
                  margin={{ top: 12, right: 12, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="currentColor"
                        stopOpacity={0.28}
                      />
                      <stop
                        offset="95%"
                        stopColor="currentColor"
                        stopOpacity={0.04}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis
                    tickFormatter={(v) => compact.format(v)}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                  <Tooltip
                    formatter={(val: number) => [KRW.format(val), "매출"]}
                    labelClassName="text-sm"
                    contentStyle={{ borderRadius: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="currentColor"
                    fill="url(#trendFill)"
                    strokeWidth={2}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              표시할 매출 데이터가 없습니다.
            </div>
          )}
        </>
      )}
    </div>
  );
}
