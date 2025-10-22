"use client";

import { useEffect, useMemo, useState } from "react";
import ChartCard from "@/components/ChartCard";
import FilterPanel from "./FilterPanel";
import { useGetPromoData } from "@/hooks/promo/useGetPromoData";
import { useQuery } from "@tanstack/react-query";
import { PromoService, type PromoResponse } from "@/lib/api/promo";

function getInitialYM() {
  const now = new Date();
  return { y: now.getFullYear(), m: now.getMonth() + 1 };
}

export default function AdsAnalysis() {
  const init = useMemo(getInitialYM, []);
  const [year, setYear] = useState(init.y);
  const [month, setMonth] = useState(init.m);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(
    null
  );

  // 프로모션 목록 (드롭다운 용)
  const {
    data: promosData,
    isLoading: promosLoading,
    isError: promosError,
  } = useQuery({
    queryKey: ["promotions-list"],
    queryFn: () => PromoService.getAll({ isActive: true }),
  });

  const promotions: PromoResponse[] = promosData?.promotions ?? [];

  // 최초 로드 시 기본 선택 (첫 번째 프로모션)
  useEffect(() => {
    if (!selectedPromotionId && promotions.length > 0) {
      setSelectedPromotionId(promotions[0]._id);
    }
  }, [promotions, selectedPromotionId]);

  // 새 API 훅 (promotionId 기반)
  const {
    data,
    isLoading: promoLoading,
    isFetching: promoFetching,
    isError: promoError,
    refetch,
  } = useGetPromoData({
    promotionId: selectedPromotionId ?? "",
    year,
    month,
  });

  const viewTimeData = data?.viewSeries ?? [];
  const clickData = data?.clickSeries ?? [];

  const anyLoading = promosLoading || promoLoading || promoFetching;
  const anyError = promosError || promoError;

  return (
    <div className="flex gap-4 max-w-6xl mx-auto mt-10 mb-5">
      <FilterPanel
        year={year}
        month={month}
        selectedPromotionId={selectedPromotionId}
        onYearChange={setYear}
        onMonthChange={setMonth}
        onPromotionChange={(id) => setSelectedPromotionId(id)}
        onApply={() => refetch()}
        promotions={promotions}
        isLoading={anyLoading}
        error={anyError}
      />

      <ChartCard
        title="광고 시청 시간 추세"
        subtitle="사용자의 광고 시청시간 추세 (분)"
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
