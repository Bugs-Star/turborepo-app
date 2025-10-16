import { useQuery, type UseQueryResult } from "@tanstack/react-query";

/** 쿼리 파라미터 */
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

  // 서버 고급 옵션(있으면 전달)
  byPurchasedTop?: number; // ex) 3
  onePerItem?: boolean; // ex) true
  requireMenuDetail?: boolean; // ex) true
};

export type GoldenPathApiItem = {
  sequence: string[];
  support: number;
  successRate: number;
  coverage: number;
  purchasedTop?: Array<{ name: string; count: number }>;
};

export type GoldenPathApiByItem = {
  item: string;
  totalSessions: number;
  top: GoldenPathApiItem[];
};

export type GoldenPathApiBucket = {
  period_type: string; // "monthly"
  period_start: string; // "2025-10-01"
  store_id: string | null;
  totalSessions: number;
  successSessions: number;
  top: GoldenPathApiItem[];
  topByItem?: GoldenPathApiByItem[];
};

export type GoldenPathApiResponse = {
  params: Record<string, unknown>;
  buckets: GoldenPathApiBucket[];
  bucketsCount: number;
};

/** 에러 상세를 담아서 던지는 HttpError */
class HttpError extends Error {
  status: number;
  url: string;
  body: string | null;
  constructor(msg: string, status: number, url: string, body: string | null) {
    super(msg);
    this.status = status;
    this.url = url;
    this.body = body;
  }
}

export async function fetchGoldenPath(
  params: GoldenPathApiParams = {}
): Promise<GoldenPathApiResponse> {
  const q = new URLSearchParams();

  // 정의된 값만 세팅
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    q.set(k, String(v));
  });

  const url = `/api/golden-path/insights${q.toString() ? `?${q}` : ""}`;

  // ✅ 요청 로그 (날짜 범위/전체 파라미터 확인)
  // 브라우저 콘솔에서 현재 호출 URL과 from/to가 정확한지 즉시 볼 수 있음
  // 필요시 제거해도 무방
  // eslint-disable-next-line no-console
  console.log("[fetchGoldenPath] GET", url, "params:", params);

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    // HTML 404일 수도 있으므로 text로 먼저 안전하게 읽는다
    let bodyText: string | null = null;
    try {
      bodyText = await res.text();
    } catch {
      bodyText = null;
    }
    throw new HttpError(
      `GoldenPath API failed with ${res.status}`,
      res.status,
      url,
      bodyText
    );
  }

  // JSON 파싱 실패 시에도 어디서 터졌는지 알 수 있도록 에러 처리
  try {
    const data = (await res.json()) as GoldenPathApiResponse;
    return data;
  } catch {
    throw new HttpError(
      "GoldenPath API JSON parse error",
      res.status,
      url,
      null
    );
  }
}

// --- React Query Hook ---
export function useGetGoldenPath(
  params: GoldenPathApiParams
): UseQueryResult<GoldenPathApiResponse, Error> {
  return useQuery<GoldenPathApiResponse, Error>({
    queryKey: ["goldenPath", params],
    queryFn: () => fetchGoldenPath(params),
    staleTime: 60_000,
    // 404 같은 경우 재시도 의미 없으면 아래처럼 끌 수 있음
    retry: (failureCount, error) => {
      if ((error as any)?.status === 404) return false;
      return failureCount < 2;
    },
  });
}
