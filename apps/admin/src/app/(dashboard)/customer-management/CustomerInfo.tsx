"use client";

import { Users, UserPlus, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useState } from "react";
import { useGetAllCustomers } from "@/hooks/customer/useGetAllCustomers";

interface StatsCardProps {
  title: string;
  value: number | string;
  change?: number; // 증감률 (%)
  icon: React.ReactNode;
  isLoading?: boolean;
  error?: boolean;
}

function fmtNum(n: number | string) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v.toLocaleString("ko-KR") : String(n);
}
function fmtPct(n?: number) {
  if (n == null || !Number.isFinite(n)) return "0";
  return Math.abs(Number(n.toFixed(2))).toLocaleString("ko-KR");
}

const StatsCard = ({
  title,
  value,
  change,
  icon,
  isLoading,
  error,
}: StatsCardProps) => {
  const isNegative = typeof change === "number" && change < 0;

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm w-full">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-3 text-muted-foreground">
        <span className="text-sm">{title}</span>
        {icon}
      </div>

      {/* 본문 */}
      {isLoading ? (
        <div className="h-8 bg-muted rounded animate-pulse" />
      ) : error ? (
        <div className="text-sm text-danger">불러오지 못했습니다.</div>
      ) : (
        <>
          <div className="text-2xl font-bold">{fmtNum(value)}명</div>
          {typeof change === "number" && (
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-2xl
                ${isNegative ? "bg-red-500 text-white" : "bg-green-700 text-white"}`}
              >
                {isNegative ? (
                  <>
                    <ArrowDownLeft size={14} /> {fmtPct(change)}%
                  </>
                ) : (
                  <>
                    <ArrowUpRight size={14} /> +{fmtPct(change)}%
                  </>
                )}
              </span>
              <span className="text-xs text-muted-foreground">전달 대비</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const CustomerInfo = () => {
  // 필요하면 페이지/리미트 상태 연결 (여기선 1페이지 고정 예시)
  const [page] = useState(1);
  const [limit] = useState(15);
  const { data, isLoading, isFetching, isError } = useGetAllCustomers(
    page,
    limit
  );

  const summary = data?.summary;

  return (
    <div className="flex gap-4">
      <StatsCard
        title="총 회원 수"
        value={summary?.totalUsers ?? 0}
        change={summary?.totalUsersGrowthRate}
        icon={<Users className="text-muted-foreground" size={20} />}
        isLoading={isLoading || isFetching}
        error={isError}
      />
      <StatsCard
        title="신규 회원 수"
        value={summary?.newUsersThisMonth ?? 0}
        change={summary?.newUsersGrowthRate}
        icon={<UserPlus className="text-muted-foreground" size={20} />}
        isLoading={isLoading || isFetching}
        error={isError}
      />
    </div>
  );
};

export default CustomerInfo;
