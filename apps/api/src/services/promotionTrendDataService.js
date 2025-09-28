/* ------------------------------------------------------------
 * File      : /src/services/promotionTrendDataService.js
 * Brief     : 프로모션 추세 데이터 조회 서비스
 * Author    : 송용훈
 * Date      : 2025-09-25
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import { queryDatabase } from "../config/clickhouse.js";

/**
 * 프로모션 시청 추세 데이터 조회 함수
 * @param {number} year - 연도
 * @param {number} month - 월
 * @returns {Promise<Array>} 시청 추세 데이터 [{name, viewDuration}, ...]
 */
export const fetchPromotionViewTrendData = async (year, month) => {
  const query = `SELECT 
                   ceil(toDayOfMonth(period_start) / 7.0) as period_label,
                   SUM(total_view_duration_seconds) as total_view_duration_seconds
                 FROM promotion_summary_by_period FINAL 
                 WHERE period_type = 'weekly'
                 AND toYear(period_start) = {year:UInt16}
                 AND toMonth(period_start) = {month:UInt8}
                 GROUP BY period_label
                 ORDER BY period_label ASC`;
  
  const query_params = { year, month };
  const results = await queryDatabase(query, query_params);
  
  // Recharts용 데이터 포맷팅
  return results.map(row => ({
    name: `${row.period_label}주`,
    viewDuration: row.total_view_duration_seconds
  }));
};

/**
 * 프로모션 클릭 추세 데이터 조회 함수
 * @param {number} year - 연도
 * @param {number} month - 월
 * @returns {Promise<Array>} 클릭 추세 데이터 [{name, clicks}, ...]
 */
export const fetchPromotionClickTrendData = async (year, month) => {
  const query = `SELECT 
                   ceil(toDayOfMonth(period_start) / 7.0) as period_label,
                   SUM(total_clicks) as total_clicks
                 FROM promotion_summary_by_period FINAL 
                 WHERE period_type = 'weekly'
                 AND toYear(period_start) = {year:UInt16}
                 AND toMonth(period_start) = {month:UInt8}
                 GROUP BY period_label
                 ORDER BY period_label ASC`;
  
  const query_params = { year, month };
  const results = await queryDatabase(query, query_params);
  
  // Recharts용 데이터 포맷팅
  return results.map(row => ({
    name: `${row.period_label}주`,
    clicks: row.total_clicks
  }));
};

/**
 * 프로모션 통합 추세 데이터 조회 함수
 * @param {number} year - 연도
 * @param {number} month - 월
 * @returns {Promise<Object>} 통합 추세 데이터 {viewTrendData: [...], clickTrendData: [...]}
 */
export const fetchPromotionTrendsData = async (year, month) => {
  const [viewTrendData, clickTrendData] = await Promise.all([
    fetchPromotionViewTrendData(year, month),
    fetchPromotionClickTrendData(year, month)
  ]);

  return {
    viewTrendData,
    clickTrendData
  };
};
