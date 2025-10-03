import { NextRequest } from "next/server";
import { getRawPathsFromClickHouse } from "@/lib/api/goldenPath";
import { computeGoldenPaths } from "@/lib/analytics/goldenPath";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // 데이터 로딩 필터 (모두 옵션)
    const period = searchParams.get("period") as
      | "daily"
      | "weekly"
      | "monthly"
      | "yearly"
      | null;
    const storeId = searchParams.get("storeId"); // 'all'이면 전체
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const limit = Number(searchParams.get("limit") ?? 5000);

    // 분석 파라미터
    const ngramMax = Number(searchParams.get("ngramMax") ?? 5);
    const minSupport = Number(searchParams.get("minSupport") ?? 3);
    const topK = Number(searchParams.get("topK") ?? 10);
    const successRateAlwaysOne =
      searchParams.get("successRateAlwaysOne") === "true";

    // 성공 엔드포인트 고정 기본값
    const successParams = searchParams.getAll("success");
    const successEndpoints = successParams.length
      ? successParams
      : ["/payment-complete"];

    const raw = await getRawPathsFromClickHouse({
      period: period || undefined,
      storeId: storeId || undefined,
      from: from || undefined,
      to: to || undefined,
      limit,
    });

    const buckets = computeGoldenPaths(raw, {
      successEndpoints,
      ngramMax,
      minSupport,
      topK,
      dedupeConsecutive: true,
      assumeAllSuccessful: true, // ✅ 전제 반영
      successRateAlwaysOne, // 필요시 true로 사용
    });

    return Response.json(
      {
        params: {
          period,
          storeId,
          from,
          to,
          limit,
          ngramMax,
          minSupport,
          topK,
          successEndpoints,
          successRateAlwaysOne,
        },
        buckets,
        bucketsCount: buckets.length,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    console.error("[GET /api/golden-path/insights] error:", err);
    return Response.json(
      {
        error: "Failed to compute golden path",
        detail: String(err?.message ?? err),
      },
      { status: 500 }
    );
  }
}
