// apps/admin/src/app/(dashboard)/ads/FilterPanel.tsx
"use client";

import type { PromoResponse } from "@/lib/api/promo";

type Props = {
  year: number;
  month: number;
  onYearChange: (y: number) => void;
  onMonthChange: (m: number) => void;
  onApply: () => void;
  promotions?: PromoResponse[];
  isLoading?: boolean;
  error?: boolean;
};

const years = (() => {
  const now = new Date().getFullYear();
  const arr: number[] = [];
  for (let y = now + 1; y >= now - 5; y--) arr.push(y);
  return arr;
})();

const months = Array.from({ length: 12 }, (_, i) => i + 1);

export default function FilterPanel({
  year,
  month,
  onYearChange,
  onMonthChange,
  onApply,
  promotions = [],
  isLoading,
  error,
}: Props) {
  return (
    <div className="w-64 space-y-4">
      {/* 조회 기간 + 조회하기 박스 */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <label className="block text-sm font-medium mb-3">조회 기간(월)</label>
        <div className="flex gap-2 mb-4">
          <select
            className="border rounded-md px-2 py-1 cursor-pointer bg-background"
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>

          <select
            className="border rounded-md px-2 py-1 cursor-pointer bg-background"
            value={month}
            onChange={(e) => onMonthChange(Number(e.target.value))}
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m}월
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onApply}
          className="w-full bg-[#005C14] text-white py-2 rounded-lg cursor-pointer disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading ? "불러오는 중…" : "조회하기"}
        </button>
      </div>

      {/* 등록한 광고 박스 */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm mt-5">
        <h3 className="text-sm font-medium mb-2">등록한 광고</h3>
        {error ? (
          <div className="text-xs text-danger">
            데이터를 불러오지 못했습니다.
          </div>
        ) : isLoading ? (
          <ul className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="h-4 bg-muted rounded animate-pulse" />
            ))}
          </ul>
        ) : promotions.length === 0 ? (
          <div className="text-xs text-muted-foreground">
            표시할 광고가 없습니다.
          </div>
        ) : (
          <ul className="space-y-2 text-sm">
            {promotions.slice(0, 6).map((p) => (
              <li key={p._id} className="truncate">
                {p.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
