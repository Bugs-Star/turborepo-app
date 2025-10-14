"use client";

import { useMemo, useState } from "react";
import { useGetRecentPurchases } from "@/hooks/customer/useGetRecentPurchases";
import Modal from "@/components/Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
};

const KRW = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

const fmtDate = (iso?: string) => (iso ? iso.slice(0, 10) : "-");

export default function PurchaseHistoryModal({
  open,
  onClose,
  userName,
  userEmail,
}: Props) {
  const [page, setPage] = useState(1);
  const limit = 10;

  // 최근 구매내역 API
  const { data, isLoading, isFetching, isError } = useGetRecentPurchases(
    userEmail,
    page,
    limit
  );

  // 테이블 로우로 가공
  const rows = useMemo(
    () =>
      (data?.purchases ?? []).map((p) => ({
        id: p.orderId,
        date: fmtDate(p.orderDate),
        items: p.itemsCount,
        total: KRW.format(p.totalAmount ?? 0),
      })),
    [data]
  );

  const hasPrev = data?.pagination?.hasPrevPage ?? false;
  const hasNext = data?.pagination?.hasNextPage ?? false;
  const current = data?.pagination?.currentPage ?? page;
  const totalPages = data?.pagination?.totalPages ?? 1;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${userName}님의 최근 구매내역`}
    >
      {/* 상태 메시지 */}
      {isError && (
        <div className="mb-3 text-sm text-danger">
          구매내역을 불러오지 못했습니다.
        </div>
      )}

      {/* 본문 */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 rounded bg-muted animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          표시할 구매내역이 없습니다.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse text-sm">
              <thead>
                <tr className="bg-muted text-muted-foreground">
                  <th className="px-3 py-2 text-left">주문번호</th>
                  <th className="px-3 py-2 text-left">주문일</th>
                  <th className="px-3 py-2 text-right">상품수</th>
                  <th className="px-3 py-2 text-right">총액</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-3 py-2">{r.id}</td>
                    <td className="px-3 py-2">{r.date}</td>
                    <td className="px-3 py-2 text-right">{r.items}</td>
                    <td className="px-3 py-2 text-right">{r.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {current} / {totalPages} 페이지 {isFetching && "· 업데이트 중…"}
            </div>
            <div className="flex gap-2">
              <button
                className="cursor-pointer rounded border border-border bg-card px-3 py-1 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!hasPrev || isLoading || isFetching}
              >
                이전
              </button>
              <button
                className="cursor-pointer rounded border border-border bg-card px-3 py-1 disabled:opacity-50"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext || isLoading || isFetching}
              >
                다음
              </button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
