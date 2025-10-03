import { NextRequest } from "next/server";
import { getRawPathsFromClickHouse } from "@/lib/api/goldenPath";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // 모두 옵션: 없으면 필터 없음
    const period = searchParams.get("period") as any | null; // "daily" | "weekly" | "monthly" | "yearly"
    const storeId = searchParams.get("storeId"); // 'all' 또는 미지정 → 필터 없음
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const limit = Number(searchParams.get("limit") ?? 2000);

    const rows = await getRawPathsFromClickHouse({
      period: period || undefined,
      storeId: storeId || undefined,
      from: from || undefined,
      to: to || undefined,
      limit,
    });

    return Response.json(
      {
        period: period ?? null,
        storeId: storeId ?? null,
        from: from ?? null,
        to: to ?? null,
        count: rows.length,
        rows,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    console.error("[GET /api/golden-path] error:", err);
    return Response.json(
      {
        error: "Failed to fetch from ClickHouse",
        detail: String(err?.message ?? err),
      },
      { status: 500 }
    );
  }
}
