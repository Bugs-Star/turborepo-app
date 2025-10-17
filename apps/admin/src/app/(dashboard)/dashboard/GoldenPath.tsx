"use client";

import { useMemo } from "react";
import { ChevronRight, Loader2, Crown } from "lucide-react";
import { iconFor } from "./GoldenPathIcons";
import type { StepKind } from "@/lib/api/goldenPathAnalysis";
import { toViewModel } from "@/lib/api/goldenPathAnalysis";
import { periodToRange, type PeriodParams } from "@/lib/period";
import {
  useGetGoldenPath,
  type GoldenPathApiParams,
} from "@/hooks/dashboard/useGetGoldenPath";

type Props = {
  params: PeriodParams;
  title?: string;
  subtitle?: string;
};

export default function GoldenPath({ params, title, subtitle }: Props) {
  const range = periodToRange(params);

  const gpParams: GoldenPathApiParams = {
    period: params.periodType,
    from: range.from,
    to: range.to,
  };

  const { data, isLoading, isError, error } = useGetGoldenPath(gpParams);
  const models = useMemo(
    () => (data?.buckets ?? []).map((b) => toViewModel(b)),
    [data]
  );

  if (isLoading) {
    return (
      <div className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        골든 패스를 불러오는 중…
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="mt-10 rounded-lg border border-border bg-card p-3 text-sm text-danger">
        골든 패스를 불러오지 못했어요.{" "}
        {error instanceof Error ? error.message : ""}
      </div>
    );
  }

  return (
    <section className="mt-10 space-y-6">
      {(title || subtitle) && (
        <header className="space-y-1">
          {title && (
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </header>
      )}

      <div className="space-y-6">
        {models.map((m) => (
          <MonthCard key={m.title} model={m} />
        ))}
      </div>
    </section>
  );
}

function MonthCard({ model }: { model: ReturnType<typeof toViewModel> }) {
  return (
    <div
      className="
        rounded-2xl border border-border bg-card shadow-sm
        [--ring:color-mix(in_oklab,var(--color-accent),transparent 75%)]
      "
    >
      {/* 상단 골든 라인 */}
      <div className="h-1 rounded-t-2xl bg-accent/50" />

      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
              <Crown className="size-[12px]" />
              Golden Path
            </div>
            <h3 className="text-lg font-bold text-foreground md:text-xl">
              {model.title}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground md:text-sm">
              가장 빈번한 고객 주문 경로 • 전체 성공 세션{" "}
              <b className="tabular-nums text-foreground">
                {model.success.toLocaleString()}
              </b>
            </p>
          </div>
        </div>

        {/* Top3 상품별 골든패스 */}
        {model.byItem && model.byItem.length > 0 && (
          <div className="mt-7">
            <SectionTitle>Top3 상품별 골든패스</SectionTitle>
            <div className="space-y-5">
              {model.byItem.map((bi, i) => (
                <div
                  key={`${bi.item}-${i}`}
                  className="
                    rounded-xl border border-border bg-card p-4
                    shadow-[0_0_0_1px_var(--color-border)]
                    hover:shadow-[0_0_0_1px_var(--color-border),0_6px_18px_-6px_var(--ring)]
                    transition-shadow
                  "
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-semibold text-foreground">
                      {bi.item}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        (성공세션 {bi.totalSessions.toLocaleString()})
                      </span>
                    </div>
                  </div>

                  {bi.rows.length === 0 ? (
                    <EmptyMsg small />
                  ) : (
                    <div className="space-y-3">
                      {bi.rows.map((row, j) => (
                        <PathRow key={`bi-${i}-${j}`} row={row} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 설명 */}
        <div className="mt-6 text-sm text-muted-foreground">
          <div>*성공 세션 : 구매완료된 세션</div>
          <div>*지원 세션 : 해당 경로가 등장한 세션 수</div>
          <div>
            *커버리지 : 전체 성공 세션 중, 이 경로를 포함한 성공 세션의 비율
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-foreground md:text-base">
      <span className="inline-block h-[10px] w-[10px] rounded-full bg-accent/60 shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-accent),transparent_80%)]" />
      {children}
    </h4>
  );
}

function EmptyMsg({ small = false }: { small?: boolean }) {
  return (
    <div className={`${small ? "text-xs" : "text-sm"} text-muted-foreground`}>
      충분한 데이터가 없어 대표 경로가 없어요.
    </div>
  );
}

/** 경로 한 줄 */
function PathRow({
  row,
}: {
  row: {
    steps: { raw: string; kind: StepKind; label: string; sub?: string }[];
    support: number;
    coverage: number;
    successRate: number;
  };
}) {
  return (
    <div
      className="
        rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5
        hover:shadow-[0_6px_18px_-6px_var(--ring)] transition-shadow
      "
    >
      <div className="flex flex-col gap-3 md:gap-4">
        {/* 메타 배지 */}
        <div className="flex items-center justify-between text-xs md:text-sm">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <Chip>
              커버리지{" "}
              <b className="ml-1 tabular-nums text-foreground">
                {Math.round(row.coverage * 100)}%
              </b>
            </Chip>
            <Chip>
              지원 세션{" "}
              <b className="ml-1 tabular-nums text-foreground">
                {row.support.toLocaleString()}
              </b>
            </Chip>
          </div>
        </div>

        {/* 경로 */}
        <div className="overflow-x-auto">
          <div className="min-w-max flex items-center gap-2 md:gap-3">
            {row.steps
              .map((s, i) => (
                <Step key={`${s.raw}-${i}`} label={s.label} sub={s.sub}>
                  {iconFor(s.kind)}
                </Step>
              ))
              .flatMap((el, i, arr) =>
                i < arr.length - 1
                  ? [
                      el,
                      <ChevronRight
                        key={`arrow-${i}`}
                        className="size-5 shrink-0 text-accent/70"
                      />,
                    ]
                  : [el]
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** 스텝 칩 */
function Step({
  children,
  label,
  sub,
  highlight = false,
}: {
  children: React.ReactNode;
  label: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center rounded-xl border px-3 py-2 shadow-sm",
        "border-border bg-card",
        "transition-transform",
        highlight
          ? // 골든 하이라이트(결제)
            "ring-2 ring-accent/40 ring-offset-0 shadow-[0_4px_14px_-6px_var(--ring)]"
          : "",
      ].join(" ")}
      title={sub ? `${label} • ${safeDecode(sub)}` : label}
    >
      <div
        className={[
          "mb-1 rounded-lg border p-2",
          "border-border",
          highlight ? "bg-accent/15 text-accent" : "bg-muted text-foreground",
        ].join(" ")}
      >
        {children}
      </div>
      <div className="text-[11px] font-medium leading-tight text-foreground md:text-xs">
        {label}
      </div>
      {sub && (
        <div className="max-w-[160px] truncate text-[10px] text-muted-foreground md:text-[11px]">
          {safeDecode(sub)}
        </div>
      )}
    </div>
  );
}

/** 메타 칩 */
function Chip({
  children,
  subtle = false,
}: {
  children: React.ReactNode;
  subtle?: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2 py-1",
        subtle ? "bg-accent/10 text-accent/90" : "bg-accent/15 text-accent",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}
