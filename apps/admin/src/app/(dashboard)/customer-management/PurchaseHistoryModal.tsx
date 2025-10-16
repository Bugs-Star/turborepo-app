"use client";

import { useMemo, useState, useEffect } from "react"; // ✅ useEffect 추가
import { useGetRecentPurchases } from "@/hooks/customer/useGetRecentPurchases";
import Modal from "@/components/Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  userId: string;
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
  userId,
}: Props) {
  const [page, setPage] = useState(1);
  const limit = 10;

  // ✅ 모달을 열 때마다, 그리고 userId가 바뀔 때 1페이지로 리셋
  useEffect(() => {
    if (open) setPage(1);
  }, [open, userId]);

  const { data, isLoading, isFetching, isError } = useGetRecentPurchases(
    userId,
    page,
    limit
  );

  const rows = useMemo(
    () =>
      (data?.orders ?? []).map((o) => {
        const firstItem = o.lines?.[0];
        return {
          id: o.orderNumber,
          date: fmtDate(o.orderDate),
          items: o.itemsCount,
          total: KRW.format(o.totalAmount ?? 0),
          productName: firstItem?.productName ?? "-",
          productImg: firstItem?.productImg ?? "",
        };
      }),
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
      {isError && (
        <div className="mb-3 text-sm text-danger">
          구매내역을 불러오지 못했습니다.
        </div>
      )}

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
                  <th className="px-3 py-2 text-left">주문아이템</th>
                  <th className="px-3 py-2 text-left">주문일</th>
                  <th className="px-3 py-2 text-right">개수</th>
                  <th className="px-3 py-2 text-right">총액</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-3 py-2 flex items-center gap-2">
                      {r.productImg && (
                        <img
                          src={r.productImg}
                          alt={r.productName}
                          className="h-8 w-8 rounded object-cover"
                        />
                      )}
                      <span>{r.productName}</span>
                    </td>
                    <td className="px-3 py-2">{r.date}</td>
                    <td className="px-3 py-2 text-right">{r.items}</td>
                    <td className="px-3 py-2 text-right">{r.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ totalPages가 2 이상일 때만 페이지네이션 표시 */}
          {totalPages > 1 && (
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
          )}
        </>
      )}
    </Modal>
  );
}
