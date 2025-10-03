// server-only
import "server-only";

/** ClickHouse 원본 1행 형태 */
export type RawPathRow = {
  period_type: string;
  period_start: string; // e.g. '2025-10-01'
  store_id: string | null;
  path: string[]; // 세션 내 방문 경로
  user_count: number;
  total_sessions: number;
};

export type GoldenPathItem = {
  sequence: string[]; // 경로 시퀀스
  support: number; // 등장 세션 수
  successRate: number; // 시퀀스가 "마지막 성공 구간"으로 등장한 비율
  coverage: number; // 전체 성공 세션 대비 커버 비율
};

export type GoldenPathBucket = {
  period_type: string;
  period_start: string;
  store_id: string | null;
  totalSessions: number;
  successSessions: number; // assumeAllSuccessful이면 == totalSessions
  top: GoldenPathItem[]; // 상위 N개
};

export type ComputeOptions = {
  /** 성공 엔드포인트들 (기본: ['/payment-complete']) */
  successEndpoints?: string[];
  /** n-gram 최대 길이 (기본 5) */
  ngramMax?: number;
  /** 최소 등장 세션 수 (기본 3) */
  minSupport?: number;
  /** 연속 중복 제거 (기본 true) */
  dedupeConsecutive?: boolean;
  /** 상위 몇 개 반환할지 (기본 10) */
  topK?: number;
  /** 모든 세션이 성공했다 가정 (기본 true) */
  assumeAllSuccessful?: boolean;
  /** 성공률을 항상 1로 둘지 (기본 false) */
  successRateAlwaysOne?: boolean;
  /** 경로 정규화 함수 */
  normalize?: (p: string) => string;
};

/* ---------- 기본 정규화 ---------- */
const ID_PARAM_REGEX = /\/[0-9a-fA-F-]{6,}(\b|\/)/g; // 숫자/UUID류 id 치환
const QUERY_REGEX = /\?.*$/;

export function defaultNormalize(p: string): string {
  let out = p || "";
  out = out.replace(QUERY_REGEX, ""); // ?query 제거
  out = out.replace(ID_PARAM_REGEX, "/:id$1"); // /123 → /:id
  // 필요시 커스텀 규칙 추가
  return out;
}

/* 연속 중복 제거 */
function dedupe(seq: string[]): string[] {
  const out: string[] = [];
  for (const v of seq)
    if (!out.length || out[out.length - 1] !== v) out.push(v);
  return out;
}

/* 성공 지점까지만 포함하여 자르기(성공 포함) */
function clipToSuccess(seq: string[], successSet: Set<string>): string[] {
  const i = seq.findIndex((s) => successSet.has(s));
  return i >= 0 ? seq.slice(0, i + 1) : seq;
}

/* 2..N n-gram 제너레이터 */
function* ngrams(seq: string[], maxN: number) {
  const L = seq.length;
  for (let n = 2; n <= maxN && n <= L; n++) {
    for (let i = 0; i <= L - n; i++) yield seq.slice(i, i + n);
  }
}

/** 버킷키: period_type + period_start + store_id */
function bucketKey(r: RawPathRow) {
  return `${r.period_type}__${r.period_start}__${r.store_id ?? ""}`;
}

/** 메인: Golden Path 계산 */
export function computeGoldenPaths(
  rows: RawPathRow[],
  opts: ComputeOptions = {}
): GoldenPathBucket[] {
  const {
    successEndpoints = ["/payment-complete"],
    ngramMax = 5,
    minSupport = 3,
    dedupeConsecutive = true,
    topK = 10,
    assumeAllSuccessful = true, // ✅ 기본값 true
    successRateAlwaysOne = false,
    normalize = defaultNormalize,
  } = opts;

  const successSet = new Set(successEndpoints.map(normalize));
  const groups = new Map<string, RawPathRow[]>();

  for (const r of rows) {
    const k = bucketKey(r);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(r);
  }

  const results: GoldenPathBucket[] = [];

  for (const [k, group] of groups) {
    const [period_type, period_start, sId] = k.split("__");
    const totalSessions = group.length;

    type C = { count: number; successCount: number };
    const counter = new Map<string, C>();

    const processed: { seq: string[]; succeeded: boolean }[] = [];
    for (const row of group) {
      let seq = row.path.map(normalize);
      if (dedupeConsecutive) seq = dedupe(seq);

      let clipped = seq;
      let succeeded = true;

      if (assumeAllSuccessful) {
        // 방어적으로 마지막 성공 지점까지만 잘라서 끝이 성공이 되게 보장
        const lastIdx = clipped.findLastIndex((v) => successSet.has(v));
        if (lastIdx >= 0) clipped = clipped.slice(0, lastIdx + 1);
        else succeeded = false; // 이론상 없지만 데이터 노이즈 대비
      } else {
        clipped = clipToSuccess(seq, successSet);
        succeeded = successSet.has(clipped[clipped.length - 1] || "");
      }

      processed.push({ seq: clipped, succeeded });
    }

    const successSessions = assumeAllSuccessful
      ? totalSessions
      : processed.filter((p) => p.succeeded).length;

    // n-gram 카운팅 (성공으로 끝나는 n-gram만)
    const toKey = (a: string[]) => a.join(" → ");
    for (const { seq, succeeded } of processed) {
      for (const ng of ngrams(seq, ngramMax)) {
        const endsWithSuccess = successSet.has(ng[ng.length - 1]);
        if (!endsWithSuccess) continue;

        const key = toKey(ng);
        const rec = counter.get(key) ?? { count: 0, successCount: 0 };
        rec.count += 1;

        if (successRateAlwaysOne || assumeAllSuccessful) {
          // ✅ 모든 세션 성공 가정 → 성공률 계산 단순화
          // (성공률을 항상 1로 보려면 successRateAlwaysOne=true)
          rec.successCount += 1;
        } else {
          // 기존 정의: "세션이 성공으로 종료" + "이 n-gram이 마지막 성공 구간까지 포함"
          if (succeeded && ng[ng.length - 1] === seq[seq.length - 1]) {
            rec.successCount += 1;
          }
        }
        counter.set(key, rec);
      }
    }

    // 지표 계산
    const items: GoldenPathItem[] = [];
    for (const [seqKey, { count, successCount }] of counter) {
      if (count < minSupport) continue;
      const sequence = seqKey.split(" → ");
      const successRate = count > 0 ? successCount / count : 0;
      const coverage = successSessions > 0 ? successCount / successSessions : 0;
      items.push({ sequence, support: count, successRate, coverage });
    }

    // 정렬: coverage → successRate → support
    items.sort(
      (a, b) =>
        b.coverage - a.coverage ||
        b.successRate - a.successRate ||
        b.support - a.support
    );

    results.push({
      period_type,
      period_start,
      store_id: sId || null,
      totalSessions,
      successSessions,
      top: items.slice(0, topK),
    });
  }

  // 보기 좋게 최신순 정렬
  results.sort((a, b) => (a.period_start < b.period_start ? 1 : -1));
  return results;
}
