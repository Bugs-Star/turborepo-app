/* ------------------------------------------------------------
 * File      : src/controllers/reportController.js
 * Brief     : reports(보고서) 조회 컨트롤러
 * Author    : 송용훈
 * Date      : 2025-09-12
 * Version   :
 * History
 * ------------------------------------------------------------*/

import { queryDatabase } from "../config/clickhouse.js";
import { validateReportRequest } from "../services/reportQueryValidator.js";
import { fetchSalesTrendData } from "../services/salesTrendDataService.js";
import { fetchVisitorTrendData } from "../services/visitorTrendDataService.js";

// 매출 요약 데이터 조회 함수
const fetchStateData = async (tableName, periodType, year, month, week) => {
  let query = `SELECT * FROM ${tableName} FINAL WHERE period_type = {periodType:String}`;
  const query_params = { periodType };

  switch (periodType) {
    case "yearly":
      if (year) {
        query += " AND toYear(period_start) = {year:UInt16}";
        query_params.year = year;
      }
      break;
    case "monthly":
      if (year) {
        query += " AND toYear(period_start) = {year:UInt16}";
        query_params.year = year;
      }
      if (month) {
        query += " AND toMonth(period_start) = {month:UInt8}";
        query_params.month = month;
      }
      break;
    case "weekly":
      // 시간대 문제를 피하기 위해 모든 날짜 계산을 UTC 기준으로 수행합니다.
      // 1. 해당 월의 첫째 날을 기준으로 날짜 객체를 생성합니다.
      const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1));
      // 2. 첫째 날의 요일(0=일요일, 6=토요일)을 가져옵니다.
      const dayOfWeek = firstDayOfMonth.getUTCDay();
      // 3. 해당 월의 첫째 주 일요일 날짜를 계산하고, 목표 주(week)까지의 날짜를 더합니다.
      //    - (1 - dayOfWeek)는 첫째 주 일요일을 찾습니다. (예: 1일이 수요일(3)이면 1-3=-2, 즉 이전 달 28일)
      //    - ((week - 1) * 7)은 목표 주까지의 날짜를 더합니다.
      const targetDay = new Date(
        Date.UTC(year, month - 1, 1 - dayOfWeek + (week - 1) * 7),
      );
      const period_start = targetDay.toISOString().split("T")[0];

      query += " AND period_start = {period_start:String}";
      query_params.period_start = period_start;
      break;
  }

  query += " ORDER BY period_start ASC";

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

    // 1. 요약 데이터 조회
    const stats = await fetchStateData(
      "sales_summary_by_period",
      periodType,
      year,
      month,
      week,
    );

    // 2. 베스트셀러 메뉴 항목 조회
    const bestsellers = await fetchStateData(
      "best_selling_menu_items",
      periodType,
      year,
      month,
      week,
    );

    // 3. 판매 추세 데이터 조회
    const salesTrendData = await fetchSalesTrendData(periodType, year, month, week);

    // 4. 사용자 활동 추세 데이터 조회
    const visitorTrendData = await fetchVisitorTrendData(periodType, year, month, week);

    // 데이터 존재 여부 확인
    if (!stats || stats.length === 0) {
      return res.status(404).json({
        message:
          "해당 기간의 sales_summary_by_period 데이터를 찾을 수 없습니다.",
      });
    }
    if (!bestsellers || bestsellers.length === 0) {
      return res.status(404).json({
        message:
          "해당 기간의 best_selling_menu_items 데이터를 찾을 수 없습니다.",
      });
    }

    // 통합 응답 데이터 구성
    const responseData = {
      summary: stats,
      bestsellers: bestsellers,
      trendData: salesTrendData,
      visitorTrendData: visitorTrendData,
      meta: {
        periodType,
        year,
        month,
        week,
        generatedAt: new Date().toISOString(),
      },
    };

    console.log("Report data:", {
      summaryCount: stats.length,
      bestsellersCount: bestsellers.length,
      salesTrendDataCount: salesTrendData.length,
      visitorTrendDataCount: visitorTrendData.length,
    });

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res
      .status(500)
      .json({ message: "Error fetching reports", error: error.message });
  }
};
