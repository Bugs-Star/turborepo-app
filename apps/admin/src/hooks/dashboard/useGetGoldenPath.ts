import { useQuery, type UseQueryResult } from "@tanstack/react-query";

export type GoldenPathApiParams = {
  period?: "weekly" | "monthly" | "yearly" | null;
  storeId?: string | null;
  from?: string | null;
  to?: string | null;
  limit?: number;
  ngramMax?: number;
  minSupport?: number;
  topK?: number;
  successRateAlwaysOne?: boolean;
};

export type GoldenPathApiItem = {
  sequence: string[];
  support: number;
  successRate: number;
  coverage: number;
};

export type GoldenPathApiBucket = {
  period_type: string; // "monthly"
  period_start: string; // "2025-10-01"
  store_id: string | null;
  totalSessions: number;
  successSessions: number;
  top: GoldenPathApiItem[];
};

export type GoldenPathApiResponse = {
  params: Record<string, unknown>;
  buckets: GoldenPathApiBucket[];
  bucketsCount: number;
};

export async function fetchGoldenPath(
  params: GoldenPathApiParams = {}
): Promise<GoldenPathApiResponse> {
  const q = new URLSearchParams();

  if (params.period) q.set("period", params.period);
  if (params.storeId) q.set("storeId", params.storeId);
  if (params.from) q.set("from", params.from);
  if (params.to) q.set("to", params.to);
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.ngramMax != null) q.set("ngramMax", String(params.ngramMax));
  if (params.minSupport != null) q.set("minSupport", String(params.minSupport));
  if (params.topK != null) q.set("topK", String(params.topK));
  if (params.successRateAlwaysOne != null) {
    q.set("successRateAlwaysOne", String(params.successRateAlwaysOne));
  }

  const url = `/api/golden-path/insights${q.toString() ? `?${q}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    // detail의 타입은 API 스펙에 없으니 안전하게 좁혀서 처리
    let detailMessage = "Failed to fetch golden path";
    try {
      const detailJson = (await res.json()) as { detail?: unknown };
      if (typeof detailJson?.detail === "string") {
        detailMessage = detailJson.detail;
      }
    } catch {
      // ignore
    }
    throw new Error(detailMessage);
  }
  const data = (await res.json()) as GoldenPathApiResponse;
  return data;
}

// --- React Query Hook ---
export function useGetGoldenPath(
  params: GoldenPathApiParams
): UseQueryResult<GoldenPathApiResponse, Error> {
  return useQuery<GoldenPathApiResponse, Error>({
    queryKey: ["goldenPath", params],
    queryFn: () => fetchGoldenPath(params),
    staleTime: 60_000,
  });
}
