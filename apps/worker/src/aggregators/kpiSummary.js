// src/aggregators/kpiSummary.js
import clickhouse from "../clickhouse/clickhouseClient.js";

/**
 * 최종 KPI 요약 테이블(kpi_summary_by_period)을 사전 집계합니다.
 * 이 함수는 visitor 및 sales 집계가 완료된 후에 실행되어야 합니다.
 * @param {'daily'|'weekly'|'monthly'|'yearly'} periodType
 */
export async function aggregateKpiSummary(periodType = "monthly") {
  let dateFunc;
  let intervalDays;

  switch (periodType) {
    case "daily":
      dateFunc = "toDate";
      intervalDays = 7;
      break;
    case "weekly":
      dateFunc = "toStartOfWeek";
      intervalDays = 30;
      break;
    case "monthly":
      dateFunc = "toStartOfMonth";
      intervalDays = 90;
      break;
    case "yearly":
      dateFunc = "toStartOfYear";
      intervalDays = 730;
      break;
    default:
      throw new Error(`Unsupported periodType: ${periodType}`);
  }

  const insertQuery = `
    INSERT INTO kpi_summary_by_period
    SELECT
        v.period_type,
        v.period_start,
        v.store_id,

        -- Visitor Metrics
        v.total_unique_visitors,
        v.engaged_visitors,
        v.bounce_rate,

        -- Sales Metrics
        COALESCE(s.unique_customers, 0) AS unique_customers,
        COALESCE(s.total_sales, 0) AS total_sales,
        COALESCE(s.total_orders, 0) AS total_orders,

        -- Combined KPIs
        if(v.total_unique_visitors > 0, round(COALESCE(s.unique_customers, 0) / v.total_unique_visitors * 100, 2), 0) AS conversion_rate,
        if(v.total_unique_visitors > 0, round(COALESCE(s.total_sales, 0) / v.total_unique_visitors, 2), 0) AS revenue_per_visitor,

        now() AS updated_at
    FROM
        visitor_summary_by_period AS v
    LEFT JOIN
        sales_summary_by_period AS s ON
            v.period_start = s.period_start AND
            v.store_id = s.store_id AND
            v.period_type = s.period_type
    WHERE
        v.period_type = '${periodType}' AND
        v.period_start >= today() - INTERVAL ${intervalDays} DAY;
  `;

  await clickhouse.exec({ query: insertQuery });
  console.log(`[Worker] ${periodType} KPI summary aggregated.`);
}