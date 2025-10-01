"use client";

import {
  useUserActivityChart,
  type PeriodParams,
} from "@/hooks/dashboard/useUserActivityChart";
import UserActivityBars from "./UserActivityBars";

export default function UserActivityTrend({
  params,
  title,
  subtitle,
  className = "",
  height = 300,
}: {
  params: PeriodParams;
  title?: string;
  subtitle?: string;
  className?: string;
  height?: number;
}) {
  const {
    chartData,
    xKey,
    yMax,
    isSingleCategory,
    weeklyDayMode,
    isLoading,
    isFetching,
    isError,
  } = useUserActivityChart(params);

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

      {/* 상태 */}
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
          <UserActivityBars
            data={chartData}
            xKey={xKey}
            yMax={yMax}
            isSingleCategory={isSingleCategory}
            weeklyDayMode={weeklyDayMode}
            month={params.month}
            height={height}
          />

          {/* 범례 */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <LegendDot color="#1E7D32" label="총 방문자 수" />
            <LegendDot color="#1F4E79" label="순 방문자 수" />
            <LegendDot color="#C28E00" label="활성 방문자 수" />
            <LegendDot color="#C0392B" label="이탈자 수" />
          </div>

          {/* 주석 */}
          <ul className="mt-3 space-y-1 text-[11px] text-muted-foreground">
            <li>※ 총 방문자 수 : 기간 내 발생한 모든 방문의 합.</li>
            <li>
              ※ 순 방문자 수 : 기간 내 중복 없이 한 번이라도 방문한 사용자 수.
            </li>
            <li>
              ※ 활성 방문자 수 : 이탈하지 않고 2페이지 이상 둘러본 방문자 수.
            </li>
            <li>※ 이탈자 수 : 단 한 페이지만 보고 떠난 방문자 수.</li>
          </ul>

          {isFetching && (
            <div className="mt-2 text-[11px] text-muted-foreground">
              최신 데이터로 동기화 중…
            </div>
          )}
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
