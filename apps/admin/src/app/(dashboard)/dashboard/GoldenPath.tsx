"use client";

import { useMemo } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { iconFor } from "./GoldenPathIcons";

import { toViewModel } from "@/lib/api/goldenPathAnalysis";
import { periodToRange, type PeriodParams } from "@/lib/period";
import {
  useGetGoldenPath,
  type GoldenPathApiParams,
  type GoldenPathApiResponse,
} from "@/hooks/dashboard/useGetGoldenPath";

type Props = {
  params: PeriodParams; // ✅ 부모에서 통일된 타입
  title?: string;
  subtitle?: string;
};

export default function GoldenPath({ params, title, subtitle }: Props) {
  // ⬇️ 내부에서 GoldenPath 전용 파라미터로 변환
  const range = periodToRange(params);
  const gpParams: GoldenPathApiParams = {
    period: params.periodType, // "weekly" | "monthly" | "yearly"
    from: range.from,
    to: range.to,
    // 필요시 기본값: minSupport: 2, topK: 8, ngramMax: 5,
  };

  const { data, isLoading, isError, error } = useGetGoldenPath(gpParams);

  const buckets = data?.buckets ?? [];
  const models: Array<ReturnType<typeof toViewModel>> = buckets.map((b) =>
    toViewModel(b)
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Loader2 className="size-4 animate-spin" />
        골든 패스를 불러오는 중…
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="text-red-600 text-sm">
        골든 패스를 불러오지 못했어요.{" "}
        {error instanceof Error ? error.message : ""}
      </div>
    );
  }

  return (
    <section className="space-y-6 mt-10">
      {(title || subtitle) && (
        <header className="space-y-1">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
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
    <div className="rounded-2xl bg-[#f7f3ea] p-4 md:p-6 border border-amber-100 shadow-sm">
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg md:text-xl font-bold">{model.title}</h3>
          <p className="text-xs md:text-sm text-gray-500">
            {`가장 빈번한 고객 주문 경로 • 성공 세션 ${model.success.toLocaleString()} / 전체 ${model.total.toLocaleString()}`}
          </p>
        </div>
        <div className="text-xs">
          <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1 bg-white">
            판매 <ChevronRight className="size-3" />
          </span>
        </div>
      </div>

      {model.rows.length === 0 ? (
        <div className="text-sm text-gray-500">
          충분한 데이터가 없어 대표 경로가 없어요.
        </div>
      ) : (
        <div className="space-y-4">
          {model.rows.map((row, idx) => (
            <PathRow key={idx} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}

function PathRow({
  row,
}: {
  row: {
    steps: { raw: string; kind: string; label: string; sub?: string }[];
    support: number;
    coverage: number;
    successRate: number;
  };
}) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-4 md:p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="flex items-center justify-between text-xs md:text-sm text-gray-600">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-1">
              커버리지 <b className="ml-1">{Math.round(row.coverage * 100)}%</b>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 px-2 py-1">
              지원(세션) <b className="ml-1">{row.support.toLocaleString()}</b>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 text-gray-700 px-2 py-1">
              성공률{" "}
              <b className="ml-1">{Math.round(row.successRate * 100)}%</b>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex items-center gap-2 md:gap-3 min-w-max">
            {row.steps
              .map((s, i) => (
                <Step key={`${s.raw}-${i}`} label={s.label} sub={s.sub}>
                  {iconFor(s.kind as any)}
                </Step>
              ))
              .flatMap((el, i, arr) =>
                i < arr.length - 1
                  ? [
                      el,
                      <ChevronRight
                        key={`arrow-${i}`}
                        className="size-5 shrink-0 text-gray-400"
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

function Step({
  children,
  label,
  sub,
}: {
  children: React.ReactNode;
  label: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-3 py-2 rounded-xl border bg-white shadow-sm">
      <div className="p-2 rounded-lg bg-slate-50 border mb-1">{children}</div>
      <div className="text-[11px] md:text-xs font-medium leading-tight">
        {label}
      </div>
      {sub && (
        <div className="text-[10px] md:text-[11px] text-gray-500 truncate max-w-[140px]">
          {safeDecode(sub)}
        </div>
      )}
    </div>
  );
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}
