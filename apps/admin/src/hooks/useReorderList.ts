"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface ReorderUpdate {
  id: string;
  order: number;
}

export interface UseReorderListOptions<TData, TItem> {
  queryKeyRoot: string;
  getList: (data: TData) => TItem[];

  setList: (data: TData, nextList: TItem[]) => TData;

  getId: (item: TItem) => string;

  setOrder: (item: TItem, order: number) => TItem;

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
  persist: (updates: ReorderUpdate[]) => Promise<void | unknown>;
}

export function useReorderList<TData, TItem>(
  opts: UseReorderListOptions<TData, TItem>
) {
  const qc = useQueryClient();
  const isRoot = (key: readonly unknown[]) => key[0] === opts.queryKeyRoot;

  return useMutation<
    void,
    unknown,
    ReorderUpdate[],
    { prev: Array<[readonly unknown[], TData | undefined]> }
  >({
    mutationKey: [opts.queryKeyRoot, "reorder"],
    mutationFn: (updates) => opts.persist(updates).then(() => undefined),

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
