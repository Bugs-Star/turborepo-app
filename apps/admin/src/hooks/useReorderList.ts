// hooks/common/useReorderList.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

/** 서버로 보낼 기본 업데이트 형태 (id + order) */
export interface ReorderUpdate {
  id: string;
  order: number;
}

export interface UseReorderListOptions<TData, TItem> {
  /** 루트 쿼리 키(예: "products", "promos") */
  queryKeyRoot: string;

  /** 캐시 데이터에서 리스트를 꺼내는 함수 */
  getList: (data: TData) => TItem[];

  /** 수정된 리스트를 다시 캐시에 넣어 새 데이터로 만드는 함수 */
  setList: (data: TData, nextList: TItem[]) => TData;

  /** 아이템의 고유 ID 추출 */
  getId: (item: TItem) => string;

  /** 아이템에 새 order를 반영해서 리턴 */
  setOrder: (item: TItem, order: number) => TItem;

  /** (선택) 리스트 정렬 함수. 주로 order 기준 오름차순 */
  sort?: (a: TItem, b: TItem) => number;

  /**
   * (선택) 어떤 캐시만 수정할지 결정.
   * 기본: queryKeyRoot로 시작하는 모든 캐시를 수정.
   */
  shouldTouchQuery?: (
    queryKey: readonly unknown[],
    data: TData | undefined
  ) => boolean;

  /**
   * (선택) 어떤 캐시에 정렬을 적용할지 결정.
   * 기본: sort가 있으면 모두 정렬.
   */
  shouldSortQuery?: (
    queryKey: readonly unknown[],
    data: TData | undefined
  ) => boolean;

  /** 실제 서버에 순서를 저장하는 배치 API */
  persist: (updates: ReorderUpdate[]) => Promise<any>;
}

/**
 * 범용 재정렬 훅: onMutate에서 낙관적 업데이트(정렬 포함) + 실패 시 롤백 + onSettled invalidate
 */
export function useReorderList<TData, TItem>(
  opts: UseReorderListOptions<TData, TItem>
) {
  const qc = useQueryClient();

  // 루트 키 판별 유틸
  const isRoot = (key: readonly unknown[]) => key[0] === opts.queryKeyRoot;

  return useMutation<
    void,
    unknown,
    ReorderUpdate[],
    { prev: Array<[readonly unknown[], TData | undefined]> }
  >({
    mutationKey: [opts.queryKeyRoot, "reorder"],
    mutationFn: (updates) => opts.persist(updates),

    async onMutate(updates) {
      // 1) 관련 쿼리 취소
      await qc.cancelQueries({
        predicate: (q) => isRoot(q.queryKey),
      });

      // 2) 이전 스냅샷 저장 (롤백용)
      const prev = qc.getQueriesData<TData>({
        queryKey: [opts.queryKeyRoot],
      }) as Array<[readonly unknown[], TData | undefined]>;

      // 3) 캐시 낙관적 수정
      const map = new Map(updates.map((u) => [u.id, u.order]));

      for (const [key, data] of prev) {
        if (!data) continue;
        if (opts.shouldTouchQuery && !opts.shouldTouchQuery(key, data))
          continue;

        const currentList = opts.getList(data);
        let nextList = currentList.map((item) => {
          const id = opts.getId(item);
          return map.has(id) ? opts.setOrder(item, map.get(id)!) : item;
        });

        const needSort =
          !!opts.sort &&
          (opts.shouldSortQuery ? opts.shouldSortQuery(key, data) : true);

        if (needSort) nextList = [...nextList].sort(opts.sort!);

        const nextData = opts.setList(data, nextList);
        qc.setQueryData(key, nextData); // key 타입 OK (readonly unknown[])
      }

      // 4) 롤백 컨텍스트 반환
      return { prev };
    },

    onError(_err, _updates, ctx) {
      // 롤백
      if (!ctx?.prev) return;
      for (const [key, data] of ctx.prev) {
        qc.setQueryData(key, data);
      }
    },

    onSettled() {
      // 서버 기준으로 재동기화
      qc.invalidateQueries({
        predicate: (q) => isRoot(q.queryKey),
        refetchType: "active",
      });
    },
  });
}
