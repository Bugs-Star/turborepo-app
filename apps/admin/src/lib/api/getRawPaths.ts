import "server-only";
import { ch } from "@/lib/clickhouse";

const VIEW = process.env.CLICKHOUSE_GOLDEN_PATH_VIEW!;
if (!VIEW) {
  throw new Error(
    "Set CLICKHOUSE_GOLDEN_PATH_VIEW (e.g. analytics.golden_paths)"
  );
}

type Period = "weekly" | "monthly" | "yearly";

export async function getRawPathsFromClickHouse(params?: {
  /** 없으면 period 필터 없음 */
  period?: Period;
  /** 없거나 'all'이면 store 필터 없음 */
  storeId?: string;
  /** 없으면 날짜 하한 없음 (주의: 응답 커질 수 있음) */
  from?: string; // YYYY-MM-DD
  /** 없으면 날짜 상한 없음 */
  to?: string; // YYYY-MM-DD
  /** 기본 2000 */
  limit?: number;
}) {
  const { period, storeId, from, to, limit = 2000 } = params || {};

  // ── 동적 필터 조각 구성 ─────────────────────────────────
  // 안쪽(서브쿼리): period / store
  const innerFilters: string[] = ["1"]; // WHERE 1 로 시작
  if (period) innerFilters.push("period_type = {period:String}");
  if (storeId && storeId !== "all")
    innerFilters.push("coalesce(store_id, '') = {storeId:String}");

  // 바깥: 날짜(ps) 필터 (둘 중 하나라도 있으면 적용)
  const outerFilters: string[] = ["1"];
  if (from) outerFilters.push("s.ps >= toDate({from:String})");
  if (to) outerFilters.push("s.ps <= toDate({to:String})");

  const sql = `
    SELECT
      s.period_type,
      toString(s.ps) AS period_start,
      s.store_id,
      s.path,
      s.purchased_items,
      s.user_count,
      s.total_sessions
    FROM (
      SELECT
        period_type,
        store_id,
        path,
        purchased_items,
        user_count,
        total_sessions,
        /* period_start를 Date로 표준화 */
        multiIf(
          toTypeName(period_start) IN ('Date','Date32'),          toDate(period_start),
          toTypeName(period_start) IN ('DateTime','DateTime64'),  toDate(period_start),
          toDate(parseDateTimeBestEffortOrNull(CAST(period_start AS String)))
        ) AS ps
      FROM {view:Identifier}
      WHERE ${innerFilters.join(" AND ")}
    ) AS s
    WHERE ${outerFilters.join(" AND ")}
    LIMIT {limit:UInt32}
  `;

  // ── 파라미터 바인딩 ─────────────────────────────────────
  type QueryParamValue = string | number | boolean | null | undefined;
  const query_params: Record<string, QueryParamValue> = {
    view: VIEW,
    limit,
  };
  if (period) query_params.period = period;
  if (storeId && storeId !== "all") query_params.storeId = storeId;
  if (from) query_params.from = from;
  if (to) query_params.to = to;

  const rs = await ch.query({
    query: sql,
    format: "JSONEachRow",
    query_params,
  });

  return (await rs.json()) as Array<{
    period_type: string;
    period_start: string; // toString(ps)
    store_id: string | null;
    path: string[];
    purchased_items: string[];
    user_count: number;
    total_sessions: number;
  }>;
}
