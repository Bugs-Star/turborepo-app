/* ------------------------------------------------------------
 * File      : src/controllers/reportController.js
 * Brief     : reports(보고서) 조회 컨트롤러
 * Author    : 송용훈
 * Date      : 2025-09-12
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import { queryDatabase } from '../config/clickhouse.js';

// reports(보고서) 조회
export const getReports = async (req, res) => {
  const { periodType } = req.params;
  const { year, month, week } = req.query;

  if (!['yearly', 'monthly', 'weekly'].includes(periodType)) {
    return res.status(400).json({ message: '잘못된 periodType 입니다. [yearly, monthly, weekly] 중 하나여야 됩니다.' });
  }

  let query = `SELECT * FROM summary_stats_by_period WHERE period_type = {periodType:String}`;
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
      if (year && month && week) {
        // 시간대 문제를 피하기 위해 모든 날짜 계산을 UTC 기준으로 수행합니다.
        // 1. 해당 달의 첫 번째 날을 UTC 기준으로 찾는다.
        const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1));
        // 2. 첫째 날이 무슨 요일인지 UTC 기준으로 구한다 (0=일요일, 1=월요일, …).
        const firstDayOfWeek = firstDayOfMonth.getUTCDay();
        // 3. 첫째 주 시작일(바로 앞 일요일)을 UTC 기준으로 구한다.
        const firstSunday = new Date(firstDayOfMonth);
        firstSunday.setUTCDate(1 - firstDayOfWeek);
        // 4. 목표 주의 시작일을 UTC 기준으로 구한다.
        const targetDate = new Date(firstSunday);
        targetDate.setUTCDate(firstSunday.getUTCDate() + (week - 1) * 7);
        // 5. 날짜를 YYYY-MM-DD 형식으로 포맷한다.
        const period_start = targetDate.toISOString().split('T')[0];
        
        query += ' AND period_start = {period_start:String}';
        query_params.period_start = period_start;
      } else {
        return res.status(400).json({ message: 'year, month, week 쿼리 파라미터는 weekly 리포트에 필수입니다.' });
      }
      break;
  }

  query += ' ORDER BY period_start ASC';

  try {
    const stats = await queryDatabase(query, query_params);

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
