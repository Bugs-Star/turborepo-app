"use client";
import axiosInstance from "./axios";

export type PeriodType = "yearly" | "monthly" | "weekly";

export interface ReportItem {
  period_type: PeriodType;
  period_start: string;
  store_id: string;
  total_sales: number;
  total_orders: number;
  avg_order_value: number;
  unique_visitors?: number;
  unique_customers?: number; // 서버가 이렇게 줄 수도 있어 대비
  total_customers?: number;
  created_at: string;
}

export interface PeriodicalParams {
  periodType: PeriodType;
  year: number;
  month?: number;
  week?: number;
}

export interface BestSellerItem {
  period_type: PeriodType;
  period_start: string;
  store_id: string;
  menu_id: string;
  menu_name: string;
  category: string;
  order_count: number;
  total_revenue: number;
  rank: number;
}

function buildParams(p: PeriodicalParams) {
  const params: Record<string, any> = { year: p.year };
  if (p.periodType !== "yearly") {
    if (p.month == null) throw new Error("month가 필요합니다.");
    params.month = p.month;
  }
  if (p.periodType === "weekly") {
    if (p.week == null) throw new Error("week가 필요합니다.");
    params.week = p.week;
  }
  return params;
}

export const DashboardApi = {
  async getPeriodicalReports(p: PeriodicalParams) {
    const { periodType } = p;
    const params = buildParams(p);

    const { data } = await axiosInstance.get<
      ReportItem[] | { summary: ReportItem[] }
    >(`/admin/reports/${periodType}`, { params });

    if (Array.isArray(data)) return data;
    if (data && Array.isArray((data as any).summary))
      return (data as any).summary;
    return [];
  },

  async getBestSellers(p: PeriodicalParams) {
    const { periodType } = p;
    const params = buildParams(p);

    const { data } = await axiosInstance.get<
      { bestsellers?: BestSellerItem[] } | BestSellerItem[]
    >(`/admin/reports/${periodType}`, { params });

    if (Array.isArray(data)) return [] as BestSellerItem[];
    return (data as any)?.bestsellers ?? [];
  },
};

export function summarize(items: ReportItem[]) {
  const total_sales = items.reduce((s, x) => s + (x.total_sales ?? 0), 0);
  const total_orders = items.reduce((s, x) => s + (x.total_orders ?? 0), 0);
  const unique_visitors = items.reduce(
    (s, x) => s + (x.unique_visitors ?? x.unique_customers ?? 0),
    0
  );
  const avg_order_value =
    total_orders > 0 ? Math.round(total_sales / total_orders) : 0;
  return { total_sales, total_orders, avg_order_value, unique_visitors };
}
