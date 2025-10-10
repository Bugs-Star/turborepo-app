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

    // ✅ 가상 성공 토큰(sentinel)
    const VIRTUAL_SUCCESS = "__SUCCESS__";

    // 성공 엔드포인트 (요청이 없더라도 기본값 + 가상 토큰 포함)
    const successParams = searchParams.getAll("success");
    const successEndpointsBase = successParams.length
      ? successParams
      : ["/payment-complete"];
    const successEndpoints = [...successEndpointsBase, VIRTUAL_SUCCESS];

    // ClickHouse에서 성공 세션만 받아온다고 가정
    const raw = await getRawPathsFromClickHouse({
      period: period || undefined,
      storeId: storeId || undefined,
      from: from || undefined,
      to: to || undefined,
      limit,
    });

    // ✅ 모든 세션 path의 끝에 가상 성공 토큰 주입
    const rawWithVirtualSuccess = raw.map((r) => ({
      ...r,
      path: r.path?.length ? [...r.path, VIRTUAL_SUCCESS] : [VIRTUAL_SUCCESS],
    }));

    // ✅ 기존 알고리즘 그대로 사용하되 성공 세션 전제 + 가상 토큰 포함
    const buckets = computeGoldenPaths(rawWithVirtualSuccess, {
      successEndpoints, // 가상 토큰 포함된 성공 집합
      ngramMax,
      minSupport,
      topK,
      dedupeConsecutive: true,
      assumeAllSuccessful: true, // 성공 세션만 가져온 전제
      successRateAlwaysOne, // 필요 시 true
      // normalize: defaultNormalize (기본값)
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
          // 에코백은 실제로 사용된 성공 엔드포인트(가상 토큰 포함)를 보여주자
          successEndpoints,
          successRateAlwaysOne,
          // 참고: 이 API는 가상 성공 토큰 주입을 사용 중
          mode: "virtual-success-sentinel",
          virtualSuccessToken: VIRTUAL_SUCCESS,
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
