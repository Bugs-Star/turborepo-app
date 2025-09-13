/* ------------------------------------------------------------
 * File      : src/controllers/reportController.js
 * Brief     : reports(보고서) 조회 컨트롤러
 * Author    : 송용훈
 * Date      : 2025-09-12
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import { queryDatabase } from '../config/clickhouse.js';


export const getReports = async (req, res) => {
  const { periodType } = req.params;
  const { year, month, week } = req.query;

  if (!['yearly', 'monthly', 'weekly' ].includes(periodType)) {
    return res.status(400).json({ message: '잘못된 periodType 입니다. [yearly, monthly, weekly] 중 하나여야 됩니다.' });
  }

  let query = `SELECT * FROM summary_stats_by_period WHERE period_type = {periodType:String}`;
  const query_params = { periodType };

  if (year) {
    query += ' AND toYear(period_start) = {year:UInt16}';
    query_params.year = year;
  }
  if (month) {
    query += ' AND toMonth(period_start) = {month:UInt8}';
    query_params.month = month;
  }
  if (week) {
    query += ' AND toWeek(period_start) = {week:UInt8}';
    query_params.week = week;
  }

  query += ' ORDER BY period_start ASC';

  try {
    const stats = await queryDatabase(query, query_params);
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};
