"use client";

import { useMemo } from "react";
import { useGetBestSeller } from "@/hooks/dashboard/useGetBestSeller";
import type { PeriodType } from "@/lib/api/dashboard";

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

function catLabel(raw?: string) {
  const v = (raw || "").toLowerCase();
  if (v === "beverage") return "음료";
  if (v === "food") return "식사";
  if (v === "goods") return "굿즈";
  return v ? v : "기타";
}

function fallbackName(menu_name: string, menu_id: string) {
  if (menu_name && menu_name.trim()) return menu_name;
  return (menu_id || "-").replace(/_/g, " ").trim();
}

export default function BestSeller({
  params,
  limit = 5,
  className = "",
}: {
  params: PeriodParams; // ✅ 반드시 상위에서 내려줘야 함
  limit?: number;
  className?: string;
}) {
  const { data, isLoading, isFetching, isError, error } = useGetBestSeller({
    periodType: params.periodType,
    year: params.year,
    month: params.periodType !== "yearly" ? params.month : undefined,
    week: params.periodType === "weekly" ? params.week : undefined,
  });

  console.log("베스트", data);

  // rank 기준으로 정렬 후 상위 N개만 추출
  const rows = useMemo(() => {
    const arr = [...(data ?? [])];
    arr.sort((a, b) => a.rank - b.rank || b.order_count - a.order_count);
    return arr.slice(0, limit);
  }, [data, limit]);

  const titlePrefix =
    params.periodType === "yearly"
      ? `${params.year}년`
      : params.periodType === "monthly" && params.month
        ? `${params.month}월`
        : params.periodType === "weekly" && params.month && params.week
          ? `${params.month}월 ${params.week}주`
          : "";

  const errMsg =
    (error as any)?.response?.data?.message ||
    (isError ? "베스트셀러 데이터를 불러오지 못했습니다." : "");

  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm mt-10 ${className}`}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-base font-semibold">베스트셀러 메뉴 항목</div>
          <div className="text-xs text-gray-500 mt-0.5">
            가장 많이 판매된 품목 목록{titlePrefix ? ` — ${titlePrefix}` : ""}
          </div>
        </div>
      </div>

      {/* 상태 */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      )}
      {isError && <div className="text-sm text-red-600">{errMsg}</div>}

      {/* 표 */}
      {!isLoading && !isError && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="text-left py-2 px-2 w-[45%]">항목명</th>
                <th className="text-left py-2 px-2 w-[20%]">카테고리</th>
                <th className="text-right py-2 px-2 w-[15%]">판매량</th>
                <th className="text-right py-2 px-2 w-[20%]">수익</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    표시할 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr
                    key={`${r.menu_id}-${r.rank}`}
                    className="border-b last:border-0"
                  >
                    <td className="py-3 px-2">
                      <div className="font-medium">
                        {fallbackName(r.menu_name, r.menu_id)}
                      </div>
                    </td>
                    <td className="py-3 px-2">{catLabel(r.category)}</td>
                    <td className="py-3 px-2 text-right">
                      {NUM.format(r.order_count)}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {KRW.format(r.total_revenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
