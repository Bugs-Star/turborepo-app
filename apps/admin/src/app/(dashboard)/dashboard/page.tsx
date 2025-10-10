"use client";

import { useState } from "react";
import PeriodControls from "./PeriodControls";
import BestSeller from "./BestSeller";
import PeriodicalAnalysis from "./PeriodicalAnalysis";
import SalesTrend from "./SalesTrend";
import UserActivityTrend from "./UserActivityTrend";
import GoldenPath from "./GoldenPath";

type PeriodType = "yearly" | "monthly" | "weekly";

type PeriodParams = {
  periodType: PeriodType;
  year: number;
  month?: number;
  week?: number;
};

const Dashboard = () => {
  const now = new Date();
  const [params, setParams] = useState<PeriodParams>({
    periodType: "monthly",
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    week: 1,
  });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* 1) 기간 선택 - 한 곳에서만 관리 */}
      <PeriodControls value={params} onChange={setParams} />

      {/* 2) 같은 기간 파라미터를 공유 */}
      <div>
        <PeriodicalAnalysis params={params} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SalesTrend params={params} />
          <BestSeller params={params} limit={5} />
        </div>
        <UserActivityTrend params={params} />
        <GoldenPath params={params} />
      </div>
    </div>
  );
};

export default Dashboard;
