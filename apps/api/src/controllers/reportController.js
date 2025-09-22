/* ------------------------------------------------------------
 * File      : src/controllers/reportController.js
 * Brief     : reports(보고서) 조회 컨트롤러
 * Author    : 송용훈
 * Date      : 2025-09-12
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import { queryDatabase } from '../config/clickhouse.js';
import { validateReportRequest } from '../services/reportQueryValidator.js';

// 매출 요약 데이터 조회 함수
const fetchSalesSummary = async (periodType, year, month, week) => {
  let query = `SELECT * FROM sales_summary_by_period WHERE period_type = {periodType:String}`;
  const query_params = { periodType };

  switch (periodType) {
    case 'yearly':
      if (year) {
        query += ' AND toYear(period_start) = {year:UInt16}';
        query_params.year = year;
      }
      break;
    case 'monthly':
      if (year) {
        query += ' AND toYear(period_start) = {year:UInt16}';
        query_params.year = year;
      }
      if (month) {
        query += ' AND toMonth(period_start) = {month:UInt8}';
        query_params.month = month;
      }
      break;
    case 'weekly':
      // 시간대 문제를 피하기 위해 모든 날짜 계산을 UTC 기준으로 수행합니다.
      const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1));         // 1. 해당 달의 첫 번째 날을 UTC 기준으로 찾는다.
      const firstDayOfWeek = firstDayOfMonth.getUTCDay();                     // 2. 첫째 날이 무슨 요일인지 UTC 기준으로 구한다 (0=일요일, 1=월요일, …).
      const firstSunday = new Date(firstDayOfMonth);                          // 3. 첫째 주 시작일(바로 앞 일요일)을 UTC 기준으로 구한다.
      firstSunday.setUTCDate(1 - firstDayOfWeek);                             // 4. 목표 주의 시작일을 UTC 기준으로 구한다.
      const targetDate = new Date(firstSunday);
      targetDate.setUTCDate(firstSunday.getUTCDate() + (week - 1) * 7);       // 5. 날짜를 YYYY-MM-DD 형식으로 포맷한다.
      const period_start = targetDate.toISOString().split('T')[0];
      
      query += ' AND period_start = {period_start:String}';
      query_params.period_start = period_start;
      break;
  }

  query += ' ORDER BY period_start ASC';

  return await queryDatabase(query, query_params);
};

// reports(보고서) 조회
export const getReports = async (req, res) => {
  try {
    // 요청 파라미터 검증
    const validation = validateReportRequest(req.params, req.query);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.error });
    }

    const { periodType, year, month, week } = validation.validatedData;

    // 매출 요약 데이터 조회
    const stats = await fetchSalesSummary(periodType, year, month, week);

    if (!stats || stats.length === 0) {
      return res.status(404).json({ message: '해당 기간의 데이터를 찾을 수 없습니다.' });
    }

    console.log(stats);
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};
