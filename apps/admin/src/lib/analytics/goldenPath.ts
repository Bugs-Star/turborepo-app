import "server-only";

/** ClickHouse 원본 1행 형태 */
export type RawPathRow = {
  period_type: string;
  period_start: string; // e.g. '2025-10-01'
  store_id: string | null;
  path: string[]; // 세션 내 방문 경로
  user_count: number;
  total_sessions: number;
  purchased_items?: string[]; // <- 구매 품목 (선택)
};

export type GoldenPathItem = {
  sequence: string[]; // 경로 시퀀스 (원시 URL)
  support: number; // 등장 세션 수
  successRate: number; // 시퀀스가 "마지막 성공 구간"으로 등장한 비율
  coverage: number; // 전체 성공 세션 대비 커버 비율
};

export type GoldenPathByItem = {
  item: string; // 상품명
  totalSessions: number; // 이 상품을 산 성공 세션 수
  top: GoldenPathItem[]; // 대표 경로(보통 1개)
};

export type GoldenPathBucket = {
  period_type: string;
  period_start: string;
  store_id: string | null;
  totalSessions: number;
  successSessions: number; // assumeAllSuccessful이면 == totalSessions
  top: GoldenPathItem[]; // 전체 상위 N개
  topByItem?: GoldenPathByItem[]; // TopN 상품별 대표 경로
};

export type ComputeOptions = {
  /** 성공 엔드포인트들 (기본: ['/payment-complete','__SUCCESS__']) */
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
  /** 성공률을 항상 1로 둘지 (기본 true) */
  successRateAlwaysOne?: boolean;
  /** 경로 정규화 함수 */
  normalize?: (p: string) => string;

  /** 많이 팔린 상위 N개 아이템 뽑기 (기본 3) */
  byPurchasedTop?: number;
  /** 각 아이템당 1개만 반환 (기본 true) */
  onePathPerItem?: boolean;
  /** 아이템 대표 경로에 반드시 `/menu/<id>` 포함 강제 (기본 true) */
  requireMenuDetailInItemPath?: boolean;
  /** 상품명 → 메뉴ID 매핑. 예: { "망고 요거트": "MANGO_YOGURT" } */
  menuIdByItem?: Record<string, string>;

  // ===== 의미 필터 & 완화 옵션 (신규) =====
  /** n-gram 최소 길이 (기본 3) */
  minNgramLength?: number;
  /** 성공 제외 본문에서 고유 페이지 최소 개수 (기본 2) */
  minDistinctPages?: number;
  /** 의미 있는 노드(포함 필수, 기본: ['/menu/', '/cart', '/checkout']) */
  requireContainsAny?: (string | RegExp)[];
  /** 이런 단일 출발지 뒤 바로 결제는 금지 (기본: ['/profile','/login','/home']) */
  disallowOnlyFromSet?: string[];
  /** 아이템별 최소 support (기본: minSupport와 동일) */
  minSupportByItem?: number;
  /** 아이템 경로 선택시 완화 단계 사용 (기본 true) */
  enableRelaxFallback?: boolean;
};

/* ---------- 기본 정규화 ---------- */
const QUERY_REGEX = /\?.*$/;

export function defaultNormalize(p: string): string {
  let out = p || "";
  out = out.replace(QUERY_REGEX, ""); // ?query 제거
  // NOTE: /menu/<slug>는 살려야 하므로 /menu/ 는 그대로 두고 기타 경로만 느슨히 보정
  return out;
}

/* 연속 중복 제거 */
function dedupe(seq: string[]): string[] {
  const out: string[] = [];
  for (const v of seq)
    if (!out.length || out[out.length - 1] !== v) out.push(v);
  return out;
}

/** 버킷키: period_type + period_start + store_id */
function bucketKey(r: RawPathRow) {
  return `${r.period_type}__${r.period_start}__${r.store_id ?? ""}`;
}

function keepOnce(arr: string[], target: string) {
  let seen = false;
  return arr.filter(
    (s) => s !== target || (s === target && !seen && (seen = true))
  );
}

/** 휴리스틱: raw rows에서 item→menuId 추정 (단일 품목 + 경로에 /menu/<id> 있을 때 최빈값 맵핑) */
export function deriveMenuLookupFromRows(
  rows: RawPathRow[]
): Record<string, string> {
  const mapCount = new Map<string, Map<string, number>>();
  for (const r of rows) {
    const items = r.purchased_items ?? [];
    if (items.length !== 1) continue; // 단일 품목일 때만 신뢰
    const item = items[0];
    const menuIds = (r.path || [])
      .filter((p) => p.startsWith("/menu/"))
      .map((p) => p.split("/")[2] || "")
      .filter(Boolean);
    if (menuIds.length === 0) continue;
    const set = mapCount.get(item) ?? mapCount.set(item, new Map()).get(item)!;
    for (const id of new Set(menuIds)) set.set(id, (set.get(id) ?? 0) + 1);
  }
  const out: Record<string, string> = {};
  for (const [item, counts] of mapCount) {
    let bestId = "";
    let best = -1;
    for (const [id, c] of counts)
      if (c > best) {
        best = c;
        bestId = id;
      }
    if (bestId) out[item] = bestId;
  }
  return out;
}

/* -------- 의미 검증 유틸 -------- */
function containsAny(seq: string[], needles: (string | RegExp)[]) {
  return seq.some((s) =>
    needles.some((n) =>
      typeof n === "string" ? s.includes(n) : (n as RegExp).test(s)
    )
  );
}

function meaningfulSeq(
  seq: string[],
  {
    minNgramLength,
    minDistinctPages,
    requireContainsAnyList,
    disallowOnlyFromSet,
  }: {
    minNgramLength: number;
    minDistinctPages: number;
    requireContainsAnyList: (string | RegExp)[];
    disallowOnlyFromSet: string[];
  }
) {
  // 성공 마지막 제거한 본문
  const body = seq.slice(0, -1);

  // 최소 길이
  if (seq.length < minNgramLength) return false;

  // 서로 다른 페이지 다양성
  const distinct = new Set(body).size;
  if (distinct < minDistinctPages) return false;

  // 의미 있는 노드(메뉴/장바구니/체크아웃) 포함
  if (
    requireContainsAnyList.length &&
    !containsAny(body, requireContainsAnyList)
  )
    return false;

  // 금지: 출발지가 금지셋이고 바로 결제로 끝나는 짧은 패턴
  if (
    body.length <= 1 &&
    body.length >= 1 &&
    disallowOnlyFromSet.includes(body[0])
  )
    return false;

  return true;
}

/* 2..N n-gram 제너레이터 → 최소 길이 반영 */
function* ngramsWithMin(seq: string[], minN: number, maxN: number) {
  const L = seq.length;
  for (let n = Math.max(2, minN); n <= maxN && n <= L; n++) {
    for (let i = 0; i <= L - n; i++) yield seq.slice(i, i + n);
  }
}

/** 메인: Golden Path 계산 */
export function computeGoldenPaths(
  rows: RawPathRow[],
  opts: ComputeOptions = {}
): GoldenPathBucket[] {
  const {
    successEndpoints = ["/payment-complete", "__SUCCESS__"],
    ngramMax = 5,
    minSupport = 3,
    dedupeConsecutive = true,
    topK = 10,
    assumeAllSuccessful = true,
    successRateAlwaysOne = true,
    normalize = defaultNormalize,

    byPurchasedTop = 3,
    onePathPerItem = true,
    requireMenuDetailInItemPath = true,
    menuIdByItem: menuIdByItemInput,

    // 의미 필터 & 완화 기본값
    minNgramLength = 3,
    minDistinctPages = 2,
    requireContainsAny = ["/menu/", "/cart", "/checkout"],
    disallowOnlyFromSet = ["/profile", "/login", "/home"],
    minSupportByItem,
    enableRelaxFallback = true,
  } = opts;

  const minSupportItem = minSupportByItem ?? minSupport;

  const successSet = new Set(successEndpoints.map(normalize));

  // 그룹화
  const groups = new Map<string, RawPathRow[]>();
  for (const r of rows) {
    const k = bucketKey(r);
    (groups.get(k) ?? groups.set(k, []).get(k)!).push(r);
  }

  // 메뉴ID 매핑 준비: 주입받지 못하면 휴리스틱으로 추정
  const menuIdByItem =
    menuIdByItemInput && Object.keys(menuIdByItemInput).length
      ? menuIdByItemInput
      : deriveMenuLookupFromRows(rows);

  const results: GoldenPathBucket[] = [];

  for (const [k, group] of groups) {
    const [period_type, period_start, sId] = k.split("__");

    type Session = { seq: string[]; purchased: string[]; hasSuccess: boolean };
    const sessions: Session[] = [];
    const itemCount = new Map<string, number>(); // 아이템 빈도(세션 단위)

    // -------- 전처리 --------
    for (const row of group) {
      let seq = (row.path || []).map(normalize);
      if (dedupeConsecutive) seq = dedupe(seq);

      // HOME/LOGIN 1회만 유지
      seq = keepOnce(keepOnce(seq, "/home"), "/login");

      // 성공 지점 찾기
      let lastIdx = -1;
      for (let i = seq.length - 1; i >= 0; i--) {
        if (successSet.has(seq[i])) {
          lastIdx = i;
          break;
        }
      }
      const clipped = lastIdx >= 0 ? seq.slice(0, lastIdx + 1) : seq;
      const purchased = row.purchased_items ?? [];
      const hasSuccess = lastIdx >= 0 || assumeAllSuccessful;

      sessions.push({ seq: clipped, purchased, hasSuccess });

      // 아이템 세기(세션 등장 1회로 집계)
      const seen = new Set<string>();
      for (const it of purchased) {
        if (seen.has(it)) continue;
        seen.add(it);
        itemCount.set(it, (itemCount.get(it) ?? 0) + 1);
      }
    }

    const totalSessions = group.length;
    const successSessions = sessions.filter((s) => s.hasSuccess).length;

    // ---------- 전역 Top ----------
    type C = { count: number; successCount: number };
    const globalCounter = new Map<string, C>();
    const toKey = (a: string[]) => a.join(" → ");

    for (const { seq } of sessions) {
      for (const ng of ngramsWithMin(seq, minNgramLength, ngramMax)) {
        if (!successSet.has(ng[ng.length - 1])) continue;

        // 의미 검증
        if (
          !meaningfulSeq(ng, {
            minNgramLength,
            minDistinctPages,
            requireContainsAnyList: requireContainsAny,
            disallowOnlyFromSet,
          })
        )
          continue;

        const key = toKey(ng);
        const rec = globalCounter.get(key) ?? { count: 0, successCount: 0 };
        rec.count += 1;
        if (successRateAlwaysOne) rec.successCount += 1;
        globalCounter.set(key, rec);
      }
    }

    const topGlobal: GoldenPathItem[] = [];
    for (const [seqKey, { count, successCount }] of globalCounter) {
      if (count < minSupport) continue;
      topGlobal.push({
        sequence: seqKey.split(" → "),
        support: count,
        successRate: count ? successCount / count : 0,
        coverage: successSessions ? successCount / successSessions : 0,
      });
    }
    topGlobal.sort(
      (a, b) =>
        b.coverage - a.coverage ||
        b.support - a.support ||
        b.sequence.length - a.sequence.length ||
        b.successRate - a.successRate
    );

    // ---------- 아이템별 대표 ----------
    const topItems = Array.from(itemCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, byPurchasedTop)
      .map(([name]) => name);

    const byItem: GoldenPathByItem[] = [];

    for (const item of topItems) {
      const itemSessions = sessions.filter((s) => s.purchased.includes(item));
      const baseNeedle = menuIdByItem[item]
        ? `/menu/${menuIdByItem[item]}`
        : null;

      // 후보 수집 함수 (필터/완화 단계 적용)
      const collect = ({
        needMenu,
        minSup,
        minLen,
      }: {
        needMenu: boolean;
        minSup: number;
        minLen: number;
      }) => {
        const counter = new Map<string, C>();
        for (const { seq } of itemSessions) {
          for (const ng of ngramsWithMin(seq, minLen, ngramMax)) {
            if (!successSet.has(ng[ng.length - 1])) continue;

            if (
              !meaningfulSeq(ng, {
                minNgramLength: minLen,
                minDistinctPages,
                requireContainsAnyList: requireContainsAny,
                disallowOnlyFromSet,
              })
            )
              continue;

            if (
              needMenu &&
              baseNeedle &&
              !ng.some((s) => s.startsWith(baseNeedle))
            )
              continue;

            const key = toKey(ng);
            const rec = counter.get(key) ?? { count: 0, successCount: 0 };
            rec.count += 1;
            if (successRateAlwaysOne) rec.successCount += 1;
            counter.set(key, rec);
          }
        }

        const out: GoldenPathItem[] = [];
        for (const [seqKey, { count, successCount }] of counter) {
          if (count < minSup) continue;
          const seq = seqKey.split(" → ");
          out.push({
            sequence: seq,
            support: count,
            successRate: count ? successCount / count : 0,
            coverage: itemSessions.length
              ? successCount / itemSessions.length
              : 0,
          });
        }
        out.sort(
          (a, b) =>
            b.coverage - a.coverage ||
            b.support - a.support ||
            b.sequence.length - a.sequence.length ||
            b.successRate - a.successRate
        );
        return out;
      };

      // 단계적 완화 시도
      let candidates: GoldenPathItem[] = [];
      // 1) 엄격: 메뉴상세 포함 + minSupportItem + minNgramLength
      candidates = collect({
        needMenu: requireMenuDetailInItemPath,
        minSup: minSupportItem,
        minLen: minNgramLength,
      });

      if (enableRelaxFallback && candidates.length === 0) {
        // 2) support 완화
        candidates = collect({
          needMenu: requireMenuDetailInItemPath,
          minSup: Math.max(1, minSupportItem - 1),
          minLen: minNgramLength,
        });
      }
      if (enableRelaxFallback && candidates.length === 0) {
        // 3) 메뉴상세 강제 해제
        candidates = collect({
          needMenu: false,
          minSup: Math.max(1, minSupportItem - 1),
          minLen: minNgramLength,
        });
      }
      if (enableRelaxFallback && candidates.length === 0) {
        // 4) 길이 2까지 허용
        candidates = collect({ needMenu: false, minSup: 1, minLen: 2 });
      }

      const finalized = onePathPerItem
        ? candidates.slice(0, 1)
        : candidates.slice(0, topK);
      byItem.push({ item, totalSessions: itemSessions.length, top: finalized });
    }

    results.push({
      period_type,
      period_start,
      store_id: sId || null,
      totalSessions,
      successSessions,
      top: topGlobal.slice(0, topK),
      topByItem: byItem,
    });
  }

  // 보기 좋게 최신순 정렬
  results.sort((a, b) => (a.period_start < b.period_start ? 1 : -1));
  return results;
}
