"use client";

import type { PromoResponse } from "@/lib/api/promo";

type Props = {
  year: number;
  month: number;
  selectedPromotionId?: string | null;
  onYearChange: (y: number) => void;
  onMonthChange: (m: number) => void;
  onPromotionChange: (id: string) => void;
  onApply: () => void;
  promotions?: PromoResponse[];
  isLoading?: boolean; // 조회 버튼 로딩
  error?: boolean; // 프로모션 목록 로딩 오류 등
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
  selectedPromotionId,
  onYearChange,
  onMonthChange,
  onPromotionChange,
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

        {/* 프로모션 선택 */}
        <label className="block text-sm font-medium mb-2">프로모션</label>
        <select
          className="border rounded-md px-2 py-1 cursor-pointer bg-background w-full mb-4"
          value={selectedPromotionId ?? ""}
          onChange={(e) => onPromotionChange(e.target.value)}
        >
          <option value="" disabled>
            프로모션을 선택하세요
          </option>
          {promotions.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title}
            </option>
          ))}
        </select>

        <div onClick={onApply} className="text-muted-foreground">
          {isLoading ? "로딩 중…" : ""}
        </div>
      </div>
    </div>
  );
}
