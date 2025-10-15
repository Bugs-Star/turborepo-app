import { NextRequest } from "next/server";
import { getRawPathsFromClickHouse } from "@/lib/api/getRawPaths";
import {
  computeGoldenPaths,
  deriveMenuLookupFromRows,
  type RawPathRow,
} from "@/lib/analytics/goldenPath";

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
    const storeId = searchParams.get("storeId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const limit = Number(searchParams.get("limit") ?? 5000);

    // 분석 파라미터
    const ngramMax = Number(searchParams.get("ngramMax") ?? 5);
    const minSupport = Number(searchParams.get("minSupport") ?? 3);
    const topK = Number(searchParams.get("topK") ?? 10);
    const successRateAlwaysOne =
      (searchParams.get("successRateAlwaysOne") ?? "true") === "true";

    const byPurchasedTop = Number(searchParams.get("byPurchasedTop") ?? 3);
    const onePathPerItem =
      (searchParams.get("onePerItem") ?? "true") === "true";
    const requireMenuDetailInItemPath =
      (searchParams.get("requireMenuDetail") ?? "true") === "true";

    // 성공 엔드포인트 (기본값)
    const VIRTUAL_SUCCESS = "__SUCCESS__";
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

    // 모든 세션 path의 끝에 가상 성공 토큰 주입
    const rawWithVirtualSuccess: RawPathRow[] = raw.map((r) => ({
      ...r,
      path: r.path?.length ? [...r.path, VIRTUAL_SUCCESS] : [VIRTUAL_SUCCESS],
    }));

    // 메뉴 매핑: 서버에 이미 사전이 있으면 주입, 아니면 휴리스틱
    // 예) DB/캐시에서 로드하여 아래에 pass 가능
    const menuIdByItem = deriveMenuLookupFromRows(rawWithVirtualSuccess);

    const buckets = computeGoldenPaths(rawWithVirtualSuccess, {
      successEndpoints,
      ngramMax,
      minSupport,
      topK,
      dedupeConsecutive: true,
      assumeAllSuccessful: true,
      successRateAlwaysOne,
      byPurchasedTop,
      onePathPerItem,
      requireMenuDetailInItemPath,
      menuIdByItem, // <- 주입
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
          byPurchasedTop,
          onePathPerItem,
          requireMenuDetailInItemPath,
          successEndpoints,
          successRateAlwaysOne,
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
