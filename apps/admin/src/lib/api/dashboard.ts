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
  unique_customers?: number;
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

/** ------ Sales Trend Types ------ */
export interface SalesTrendPoint {
  name: string;
  sales: number;
  date?: string;
}

/** ------ [NEW] User Activity Trend Types ------ */
export interface UserActivityPoint {
  name: string; // "1주", "2주" ...
  totalVisitors: number; // 총 방문자 수
  uniqueVisitors: number; // 순 방문자 수
  activeVisitors: number; // 활성 방문자 수(2페이지 이상)
  bounce: number; // 이탈자 수(한 페이지만 본 사용자)
}

type ReportsResponse =
  | ReportItem[]
  | { summary: ReportItem[]; bestsellers?: BestSellerItem[] };

type BestsellersResponse =
  | BestSellerItem[]
  | { bestsellers?: BestSellerItem[] };

type SalesTrendResponse = SalesTrendPoint[] | { trendData?: SalesTrendPoint[] };

/** [NEW] User Activity Trend Response Union */
type UserActivityTrendResponse =
  | UserActivityPoint[]
  | {
      visitorTrendData?: Array<
        Partial<UserActivityPoint> & Record<string, string | number>
      >;
    };

/** 타입가드 */
function hasSummary(
  d: ReportsResponse
): d is { summary: ReportItem[]; bestsellers?: BestSellerItem[] } {
  return typeof d === "object" && !Array.isArray(d) && Array.isArray(d.summary);
}
function hasBestsellers(
  d: BestsellersResponse
): d is { bestsellers?: BestSellerItem[] } {
  return typeof d === "object" && !Array.isArray(d);
}
function hasTrend(
  d: SalesTrendResponse
): d is { trendData?: SalesTrendPoint[] } {
  return typeof d === "object" && !Array.isArray(d);
}
/** [NEW] visitorTrendData 타입가드 */
function hasVisitorTrend(
  d: UserActivityTrendResponse
): d is { visitorTrendData?: any[] } {
  return typeof d === "object" && !Array.isArray(d);
}

/** 쿼리 파라미터 빌더 (숫자만) */
function buildParams(p: PeriodicalParams): Record<string, number> {
  const params: Record<string, number> = { year: p.year };
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

    const { data } = await axiosInstance.get<ReportsResponse>(
      `/admin/reports/${periodType}`,
      { params }
    );

    if (Array.isArray(data)) return data;
    if (hasSummary(data)) return data.summary;
    return [];
  },

  async getBestSellers(p: PeriodicalParams) {
    const { periodType } = p;
    const params = buildParams(p);

    const { data } = await axiosInstance.get<BestsellersResponse>(
      `/admin/reports/${periodType}`,
      { params }
    );

    if (Array.isArray(data)) return [];
    if (hasBestsellers(data) && Array.isArray(data.bestsellers)) {
      return data.bestsellers;
    }
    return [];
  },

  async getSalesTrend(p: PeriodicalParams) {
    const { periodType } = p;
    const params = buildParams(p);

    const { data } = await axiosInstance.get<SalesTrendResponse>(
      `/admin/reports/${periodType}`,
      { params }
    );

    if (Array.isArray(data)) return data;
    if (hasTrend(data) && Array.isArray(data.trendData)) return data.trendData;
    return [];
  },

  async getUserActivityTrend(p: PeriodicalParams) {
    const { periodType } = p;
    const params = buildParams(p);

    const { data } = await axiosInstance.get<UserActivityTrendResponse>(
      `/admin/reports/${periodType}`,
      { params }
    );

    const normalize = (rows: any[]): UserActivityPoint[] =>
      (rows ?? []).map((r) => ({
        name: String(r.name ?? ""),
        totalVisitors: Number(r.totalVisitors ?? 0),
        uniqueVisitors: Number(r.uniqueVisitors ?? 0),
        activeVisitors: Number(r.activeVisitors ?? 0),
        bounce: Number(r.bounce ?? 0),
      }));

    if (Array.isArray(data)) return normalize(data);
    if (hasVisitorTrend(data) && Array.isArray(data.visitorTrendData)) {
      return normalize(data.visitorTrendData);
    }
    return [];
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
