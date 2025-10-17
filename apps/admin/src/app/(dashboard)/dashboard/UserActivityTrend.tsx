"use client";

import {
  useUserActivityChart,
  type PeriodParams,
} from "@/hooks/dashboard/useUserActivityChart";
import UserActivityBars from "./UserActivityBars";
import { isAxiosError } from "axios";

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
    isFetching: _isFetching,
    isError,
    error, // ✅ 훅이 error를 반환한다고 가정
  } = useUserActivityChart(params);

  /** 에러 메시지 파서: 404는 고정 문구, 그 외는 서버/클라 메시지 노출 */
  function parseErrorMessage(err: unknown): string {
    if (isAxiosError<{ message?: string }>(err)) {
      const status = err.response?.status;
      if (status === 404) return "사용자 활동 데이터가 없습니다.";
      return (
        err.response?.data?.message ||
        err.message ||
        "요청 중 오류가 발생했습니다."
      );
    }
    if (err instanceof Error)
      return err.message || "알 수 없는 오류가 발생했습니다.";
    if (typeof err === "string") return err;
    try {
      return JSON.stringify(err);
    } catch {
      return "알 수 없는 오류가 발생했습니다.";
    }
  }

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

  const errorMsg = isError ? parseErrorMessage(error) : "";

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
        <div className="text-sm text-danger">{errorMsg}</div>
      )}

      {/* 차트 / 빈 데이터 */}
      {!isLoading && !isError && (
        <>
          {chartData.length > 0 ? (
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
                  ※ 순 방문자 수 : 기간 내 중복 없이 한 번이라도 방문한 사용자
                  수.
                </li>
                <li>
                  ※ 활성 방문자 수 : 이탈하지 않고 2페이지 이상 둘러본 방문자
                  수.
                </li>
                <li>※ 이탈자 수 : 단 한 페이지만 보고 떠난 방문자 수.</li>
              </ul>

              {/* 리패칭 상태 */}
              {/* {_isFetching && (
                <div className="mt-2 text-[11px] text-muted-foreground">
                  최신 데이터로 동기화 중…
                </div>
              )} */}
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              표시할 사용자 활동 데이터가 없습니다.
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
