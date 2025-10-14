// apps/admin/src/app/(dashboard)/ads/AdsAnalysis.tsx
"use client";

import { useMemo, useState } from "react";
import ChartCard from "@/components/ChartCard";
import FilterPanel from "./FilterPanel";
import { useGetPromoData } from "@/hooks/promo/useGetPromoData";

function getInitialYM() {
  const now = new Date();
  return { y: now.getFullYear(), m: now.getMonth() + 1 };
}

export default function AdsAnalysis() {
  const init = useMemo(getInitialYM, []);
  const [year, setYear] = useState(init.y);
  const [month, setMonth] = useState(init.m);

  const { data, isLoading, isFetching, isError, refetch } = useGetPromoData({
    year,
    month,
  });

  const promotions = data?.promotions ?? [];
  const viewTimeData = data?.viewSeries ?? [];
  const clickData = data?.clickSeries ?? [];

  return (
    <div className="flex gap-4 max-w-6xl mx-auto mt-10 mb-5">
      <FilterPanel
        year={year}
        month={month}
        onYearChange={setYear}
        onMonthChange={setMonth}
        onApply={() => refetch()}
        promotions={promotions}
        isLoading={isLoading || isFetching}
        error={isError}
      />

      <ChartCard
        title="광고 시청 시간 추세"
        subtitle="사용자의 광고 시청시간 추세"
        data={viewTimeData}
        label="광고 시청 시간"
        fillColor="#8FD27F"
      />

      <ChartCard
        title="광고 클릭 추세"
        subtitle="사용자의 광고 클릭 건수"
        data={clickData}
        label="광고 클릭 건수"
        fillColor="#3F842E"
      />
    </div>
  );
}
