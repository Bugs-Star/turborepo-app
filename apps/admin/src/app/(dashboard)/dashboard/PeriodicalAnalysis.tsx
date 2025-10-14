"use client";

import { useMemo } from "react";
import { useGetPeriodicalAnalysis } from "@/hooks/dashboard/useGetPeriodicalAnalysis";
import { summarize } from "@/lib/api/dashboard";
import StatCard from "@/components/StatCard";
import { isAxiosError } from "axios";

const KRW = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("ko-KR");

type PeriodType = "yearly" | "monthly" | "weekly";
type PeriodParams = {
  periodType: PeriodType;
  year: number;
  month?: number;
  week?: number;
};

export default function PeriodicalAnalysis({
  params,
}: {
  params: PeriodParams;
}) {
  const { data, isLoading, isError, error } = useGetPeriodicalAnalysis({
    periodType: params.periodType,
    year: params.year,
    month: params.periodType !== "yearly" ? params.month : undefined,
    week: params.periodType === "weekly" ? params.week : undefined,
  });

  const sum = useMemo(() => summarize(data ?? []), [data]);

  const errorMsg = isAxiosError<{ message?: string }>(error)
    ? (error.response?.data?.message ?? "데이터를 불러오지 못했습니다.")
    : isError
      ? "데이터를 불러오지 못했습니다."
      : "";

  const titlePrefix =
    params.periodType === "yearly"
      ? `${params.year}년`
      : params.periodType === "monthly" && params.month
        ? `${params.month}월`
        : params.periodType === "weekly" && params.month && params.week
          ? `${params.month}월 ${params.week}주`
          : "";

  return (
    <div className="max-w-6xl mx-auto text-foreground">
      {isLoading && (
        <div className="text-sm text-muted-foreground">불러오는 중...</div>
      )}
      {isError && <div className="text-sm text-danger">{errorMsg}</div>}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label={`${titlePrefix} 총 판매액`}
            value={KRW.format(sum.total_sales)}
          />
          <StatCard
            label={`${titlePrefix} 총 주문 수`}
            value={NUM.format(sum.total_orders)}
          />
          <StatCard
            label={`${titlePrefix} 평균 주문액`}
            value={KRW.format(sum.avg_order_value)}
          />
          <StatCard
            label={`${titlePrefix} 방문자 수`}
            value={NUM.format(sum.unique_visitors)}
          />
        </div>
      )}
    </div>
  );
}
