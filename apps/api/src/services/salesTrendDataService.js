/* ------------------------------------------------------------
 * File      : /src/services/salesTrendDataService.js
 * Brief     : 판매 추세 데이터 조회 서비스
 * Author    : 송용훈
 * Date      : 2025-09-25
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import { queryDatabase } from "../config/clickhouse.js";

/**
 * 판매 추세 데이터 조회 함수
 * @param {string} periodType - 기간 타입 (yearly, monthly, weekly)
 * @param {number} year - 연도
 * @param {number} month - 월 (monthly, weekly에서 사용)
 * @param {number} week - 주 (weekly에서 사용)
 * @returns {Promise<Array>} 판매 추세 데이터 [{name, sales}, ...]
 */
export const fetchSalesTrendData = async (periodType, year, month, week) => {
  let query, query_params, chartPeriodType;

  switch (periodType) {
    case "yearly":
      // yearly 요청시 해당 연도의 monthly 데이터 조회
      chartPeriodType = "monthly";
      query = `SELECT 
                 toMonth(period_start) as period_label,
                 SUM(total_sales) as total_sales
               FROM sales_summary_by_period FINAL 
               WHERE period_type = {chartPeriodType:String}
               AND toYear(period_start) = {year:UInt16}
               GROUP BY toMonth(period_start)
               ORDER BY period_label ASC`;
      query_params = { chartPeriodType, year };
      break;

    case "monthly":
      // monthly 요청시 해당 월의 weekly 데이터 조회
      chartPeriodType = "weekly";
      query = `SELECT 
                 ceil(toDayOfMonth(period_start) / 7.0) as period_label,
                 SUM(total_sales) as total_sales
               FROM sales_summary_by_period FINAL 
               WHERE period_type = {chartPeriodType:String}
               AND toYear(period_start) = {year:UInt16}
               AND toMonth(period_start) = {month:UInt8}
               GROUP BY period_label
               ORDER BY period_label ASC`;
      query_params = { chartPeriodType, year, month };
      break;

    case "weekly":
      // weekly 요청시 해당 주의 daily 데이터 조회
      chartPeriodType = "daily";
      
      // 해당 주의 시작일과 종료일 계산
      const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1));
      const firstDayOfWeek = firstDayOfMonth.getUTCDay();
      const firstSunday = new Date(firstDayOfMonth);
      firstSunday.setUTCDate(1 - firstDayOfWeek);
      const weekStart = new Date(firstSunday);
      weekStart.setUTCDate(firstSunday.getUTCDate() + (week - 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setUTCDate(weekStart.getUTCDate() + 6);

      const weekStartStr = weekStart.toISOString().split("T")[0];
      const weekEndStr = weekEnd.toISOString().split("T")[0];

      query = `SELECT 
                 toDayOfMonth(period_start) as period_label,
                 SUM(total_sales) as total_sales
               FROM sales_summary_by_period FINAL 
               WHERE period_type = {chartPeriodType:String}
               AND period_start >= {weekStart:String}
               AND period_start <= {weekEnd:String}
               GROUP BY period_label
               ORDER BY period_label ASC`;
      query_params = { chartPeriodType, weekStart: weekStartStr, weekEnd: weekEndStr };
      break;

    default:
      throw new Error(`지원하지 않는 periodType입니다: ${periodType}`);
  }

  const results = await queryDatabase(query, query_params);
  
  // Recharts용 판매 추세 데이터 포맷팅
  return results.map(row => {
    // period_label을 name으로 변환
    let name;
    switch (periodType) {
      case "yearly":
        name = `${row.period_label}월`;
        break;
      case "monthly":
        name = `${row.period_label}주`;
        break;
      case "weekly":
        name = `${row.period_label}일`;
        break;
      default:
        name = row.period_label.toString();
    }

    return {
      name: name,
      sales: row.total_sales
    };
  });
};

// 기존 함수명 호환성을 위한 alias (deprecated)
export const fetchTrendData = fetchSalesTrendData;
export const fetchChartData = fetchSalesTrendData;
